var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskSchema = new Schema( {
    text: String,
    owner: String,
    completed: Boolean,
    dateCreated: Date,
    dateCompleted: Date
});

var Task = mongoose.model('Task', taskSchema);

// change for commit

module.exports = Task;