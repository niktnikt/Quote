const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var heartedUserSchema = new Schema({
	userId: String //id of users who left a heart under this post
});

var commentSchema = new Schema({
	commentId: String //id of comment 
});


//create quote schema
var quoteSchema = new Schema({
	category: String,
	quote: String,
	userId: String, //id of the user who posted this quote
	date: String, //time when the quote was posted
	meta: {
		hearts: {type: Number, default: 0}, //number of hearts
		heartedUsers: [heartedUserSchema] //ids of users who left a heart under this quote
	},
	comments: [commentSchema]
})

//create quote model
var Quote = mongoose.model('quote', quoteSchema);

module.exports = Quote;