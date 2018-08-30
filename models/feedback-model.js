const mongoose = require('mongoose');

var Schema = mongoose.Schema;

//create feedback schema
var feedbackSchema = new Schema({
	userId: String, //id of user hwo submitted this feedback
	title: String,
	body: String,
	date: String //date when the feedabck was submitted
});

var Feedback = mongoose.model('feedback', feedbackSchema);

module.exports = Feedback;