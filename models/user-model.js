const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quoteSchema = new Schema({
	quoteId: String //id of posted quote
})

var heartedQuotesSchema = new Schema({
	quoteId: String //id of quotes the user hearted 
})

var commentSchema = new Schema({
	commentId: String //id of comment 
});

var heartedCommentsSchema = new Schema({
	commentId: String //id of comments the user hearted 
});

var otherUsersCommentsSchema = new Schema({
	commentId: String //id of comments made below the user's quotes
});


//create user schema
var userSchema = new Schema({
	username: String,
	googleId: String,
	thumbnail: {type: String, default: '/default-profile-picture.svg'},
	profileDescription: String,
	preferences: {
		profileBackground: {type: String, default: '#000'},
		profileFontColor: {type: String, default: '#fff'}
	},
	meta: {
		totalHearts: {type: Number, default: 0} //total number of hearts received from all quotes
	},
	quotes: [quoteSchema], //ids of uploaded quotes
	heartedQuotes: [heartedQuotesSchema], //ids of hearted quotes
	comments: [commentSchema],
	heartedComments: [heartedCommentsSchema],
	otherUsersComments: [otherUsersCommentsSchema], //ids of comments made below the user's quotes
	birthday: String //date the user joined
}, {versionKey: false})

//create user model
var User = mongoose.model('user', userSchema);

module.exports = User;