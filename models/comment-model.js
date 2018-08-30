const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var heartedUserSchema = new Schema({
	userId: String //id of users who left a heart under this post
})

var commentSchema = new Schema({
	comment: String,
	author: String, //id of user who posted this commment
	date: String,
	quoteId: String, //id of quote to which this comment refers to
	meta: {
		hearts: {type: Number, default: 0},
		heartedUsers: [heartedUserSchema]
	},

})

var Comment = mongoose.model('comment', commentSchema);

module.exports = Comment