var express = require('express');
var router = express.Router();
var passport = require('passport');
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

/* GET Login page. */
router.get('/login', function(req, res, next) {
    res.render('index');
});

/* GET signup page. */
router.get('/signup', function(req, res, next) {
    res.render('signup');
});


/* POST to login page. */
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/usr/',
    failureRedirect: '/login',
    failureFlash: true
}));

/* POST to signup page. */
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/usr/',
    failureRedirect: '/signup',
    failureFlash: true
}));

/* GET secret page*/
router.get('/usr/', isLoggedIn, function (req, res, next) {
    var user = req.user;
    var user_name = user.local.username;
    var user_id = user._id;

    console.log(user_id);

    if (user) {
        Task.find( { completed: false, owner: user_id } ) // , owner: user_name
            .then( (docs) => {
                res.render('user', {user: user, tasks: docs});
            }).catch( (err) => {
                next(err)
        });
    } else {
        res.redirect('/');
    }
});


/* Middle ware to determine logged in*/
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/')
    }
}

// route to logout
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/usr/completed', isLoggedIn, function(req, res, next) {

    var user = req.user;
    var user_name = user.local.username;
    var user_id = user._id;

    console.log("in completed");
    console.log(user_name);
    console.log(user_id);

    Task.find( { completed: true, owner: user_id } )
        .then( (docs) => {
            res.render('tasks_completed', { title: 'Completed Tasks', user: user_name, tasks: docs });
        }).catch( (err) => {
        next(err);
    });

});

router.get('/usr/:_id', function(req, res, next) {
    var _id = req.params._id;
    Task.findOne( { owner: req.user._id, _id: _id} )
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


router.post('/add', function (req, res, next) {
    if (!req.body || !req.body.text) {
        // no text info, redirect with flash message
        req.flash('error', 'please enter a task');
        res.redirect('/usr/'); // TODO be user friendly
    } else {

        var user_id = req.body.user;

        // console.log(user);

        console.log("in add");
        // console.log(req.body.user);

        console.log(user_id)

        var d = new Date();
        new Task({ text: req.body.text, owner: user_id, completed: false, dateCreated: d}).save()
            .then( (newTask) => {
                console.log('new task created is', newTask);
                res.redirect('/usr/');
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
    Task.findOneAndUpdate( { owner: req.user._id, _id: _id}, {$set: {completed: true, dateCompleted: d}})
        .then( (updtedTask) => {
            if (updtedTask) {
                req.flash('info', 'Task Completed.');
                res.redirect('/usr');
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
    Task.updateMany( { owner: req.user._id, completed: false }, { $set: {completed: true, dateCompleted: d}} )
        .then((result) => {
            req.flash('info', 'All Tasks Completed!');
            res.redirect('/usr/');
        }).catch((err) => {
            next(err);
        }
    );
});

router.post('/delete', function (req, res, next) {
    var _id = req.body._id;
    Task.deleteOne( { owner: req.user._id, _id: _id})
        .then( (result) =>{
            if (result.deletedCount === 1) {
                req.flash('info', 'Task Deleted');
                res.redirect('/usr/');
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
    Task.deleteMany( { owner: req.user._id , completed: true})
        .then( (result) =>{
            req.flash('info', 'All Completed Tasks Deleted');
            res.redirect('/usr/');
        })
        .catch((err) => {
                next(err);
            }
        );
});

module.exports = router;
