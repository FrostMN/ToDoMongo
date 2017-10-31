var express = require('express');
var router = express.Router();
var Task = require('../models/task.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    Task.find( {completed: false})
        .then( (docs) => {
            res.render('index', { title: 'Incomplete Tasks', tasks: docs });
        })
    .catch( (err) => {
        next(err);
    });
});

router.get('/task/:_id', function(req, res, next) {
    var _id = req.params._id;
    Task.findOne( {_id: ObjectID(_id)} )
        .then( (doc) => {
            if (doc === null) {
                var notFound = Error('Not Found');
                notFound.status = 404;
                next(notFound);
            } else {
                res.render('task', {title: 'Task', task: doc})
            }
        })

    // if (!ObjectID.isValid(_id)) {
    //     var notFound = Error('Not Found');
    //     notFound.status = 404;
    //     next(notFound);
    // } else {
    //     req.tasks.findOne({_id: ObjectID(_id)}).then((doc) => {
    //         if (doc === null) {
    //             var notFound = Error('Not Found');
    //             notFound.status = 404;
    //             next(notFound);
    //         } else {
    //             res.render('task', {title: 'Task', task: doc})
    //         }
    //     })
            .catch((err) => {
                next(err);
            })
    // }
});


router.get('/completed', function(req, res, next) {

    Task.find( {completed: true} )

    req.tasks.find( {completed:true} ).toArray().then( (docs) => {
        res.render('tasks_completed', { title: 'Completed Tasks', tasks: docs });
    }).catch( (err) => {
        next(err);
    });
});

router.post('/add', function (req, res, next) {
    if (!req.body || !req.body.text) {
        // no text info, redirect with flash message
        req.flash('error', 'please enter a task');
        res.redirect('/'); // TODO be user friendly
    } else {
        req.tasks.insertOne( {text: req.body.text, completed: false} )
            .then( () => {
                res.redirect('/')
            })
            .catch( (err) => {
                next(err);
            })
    }
});

router.post('/done', function (req, res, next) {
    var _id = req.body._id;

    if (!ObjectID.isValid(_id)) {
        var notFound = Error('Not Found');
        notFound.status = 404;
        next(notFound);
    } else {
        req.tasks.findOneAndUpdate({_id: ObjectID(_id)}, {$set: {completed: true}})
            .then((result) => {
                if (result.lastErrorObject.n === 1) {
                    res.redirect('/');
                } else {
                    // task not found 404
                    var notFound = Error('Task Not Found');
                    notFound.status = 404;
                    next(notFound);
                }
            })
            .catch((err) => {
                next(err);
            });
    }
});

router.post('/alldone', function (req, res, next) {
    req.tasks.updateMany( { completed: false }, { $set: {completed: true}} )
        .then((result) => {
                res.redirect('/');
    }).catch((err) => {
            next(err);
        });

});

router.post('/delete', function (req, res, next) {
    var _id = req.body._id;

    if (!ObjectID.isValid(_id)) {
        var notFound = Error('Not Found');
        notFound.status = 404;
        next(notFound);
    } else {
        req.tasks.findOneAndDelete({_id: ObjectID(_id)}, {$set: {completed: true}})
            .then((result) => {
                if (result.lastErrorObject.n === 1) {
                    res.redirect('/');
                } else {
                    // task not found 404
                    var notFound = Error('Task Not Found');
                    notFound.status = 404;
                    next(notFound);
                }
            })
            .catch((err) => {
                next(err);
            });
    }
});

module.exports = router;
