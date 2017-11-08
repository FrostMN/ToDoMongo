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
    Task.findOne( {_id: _id} )
        .then( (task) => {
            if (task) {
                res.render('task', {title: 'Task', task: task})
            } else {
                res.status(404).send('task not found');
            }
        })
        .catch((err) => {
            next(err);
        }
    );
});


router.get('/completed', function(req, res, next) {
    Task.find( {completed: true} )
        .then( (docs) => {
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
        var d = new Date();
        new Task({ text: req.body.text, completed: false, dateCreated: d}).save()
            .then( (newTask) => {
                console.log('new task created is', newTask);
                res.redirect('/');
            })
            .catch( (err) => {
                next(err);
            }
        );
    }
});

router.post('/done', function (req, res, next) {
    var _id = req.body._id;
    var d = new Date();
    Task.findOneAndUpdate( {_id: _id}, {$set: {completed: true, dateCompleted: d}})
        .then( (updtedTask) => {
            if (updtedTask) {
                req.flash('info', 'Task Completed.');
                res.redirect('/');
            } else {
                res.status(404).send("Error marking task done: not found")
            }
        })
        .catch((err) => {
            next(err);
        }
    );
});

router.post('/alldone', function (req, res, next) {
    var d = new Date();
    Task.updateMany( { completed: false }, { $set: {completed: true, dateCompleted: d}} )
        .then((result) => {
            req.flash('info', 'All Tasks Completed!');
            res.redirect('/');
        }).catch((err) => {
            next(err);
        }
    );
});

router.post('/delete', function (req, res, next) {
    var _id = req.body._id;
    Task.deleteOne( {_id: _id})
        .then( (result) =>{
            if (result.deletedCount === 1) {
                req.flash('info', 'Task Deleted');
                res.redirect('/');
            } else {
                res.status(404).send("Error deleting task: not found");
            }
        })
        .catch((err) => {
                next(err);
            }
        );
});

router.post('/deleteDone', function (req, res, next) {
    var _id = req.body._id;
    Task.deleteMany( {completed: true})
        .then( (result) =>{
            req.flash('info', 'All Completed Tasks Deleted');
            res.redirect('/');
        })
        .catch((err) => {
                next(err);
            }
        );
});

module.exports = router;
