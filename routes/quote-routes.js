const router = require('express').Router();
const Quote = require('../models/quote-model.js');
const User = require('../models/user-model.js');
const Comment = require('../models/comment-model.js');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const authCheck = require('../config/auth-check.js');
const commentSubmitCheck = require('../config/comment-submit-check.js');
const moment = require('moment'); //used for formating dates in ejs

function CheckIfHeartedQuote(req){
	var found = false;
	for(var i = 0; i < req.user.heartedQuotes.length; i++){
		if(req.user.heartedQuotes[i].quoteId === req.params.id){ //check if user has already hearted the current quote
			found = true; //if yes then change found to true
			break; //stop the loop
		}
	}
	return found
}

function CheckIfHeartedComment(req){
	var found = false;
	for(var i = 0; i < req.user.heartedComments.length; i++){
		if(req.user.heartedComments[i].commentId === req.params.commentId){
			found = true;
			break
		}
	}
	return found
}

router.get('/:id', function(req, res){
	Quote.findOne({_id: req.params.id}).then(function(retrivedQuote){
		User.findOne({_id: retrivedQuote.userId}).then(function(retrivedUser){ //find author of the quote
			if(req.user){ //preform the check only if the user is logged in
				var foundQuoteHeart = CheckIfHeartedQuote(req); //check if user hearted this quote before
				//create a new array of only the commentId properties from the req.user.Heartedcomments array
				var userHeartedComments = req.user.heartedComments.map(function(e){
					return e.commentId;
				});
				//create a new array of only the commentId properties from the req.user.comments array --> used to check which comments were submitted by user
				var userSubmittedComments = req.user.comments.map(function(e){
					return e.commentId
				})
			}

			//similar quotes
			//generate array of 5 different random numbers
			Quote.count({'category': retrivedQuote.category}).then(function(count){ //find length of quote collection
				//if there aren't enough quotes of the same category --> get any random quotes
				if(count < 5){
					Quote.count({}).then((count1) => {
						var randomNumbers = [];
						while(randomNumbers.length < 5){
							var random = Math.floor(Math.random() * count1);
							if (randomNumbers.indexOf(random) != -1){
								continue;
							}else{
								randomNumbers.push(random);
							}
						}
						//create empty array ==> place for promise objects
						var promisesSuggestedQuotes = [];
						for(var i = 0; i < randomNumbers.length; i++){
							//add the promise object of the retrvied quote to the array
							promisesSuggestedQuotes.push(Quote.findOne({}).skip(randomNumbers[i]));
						};
						//resolve all the promises ==> get array of suggested  quotes
						Promise.all(promisesSuggestedQuotes).then((resultSuggestedQuotes) =>{
							//decide by what to sort
							var sortCriteria = null;
							switch(req.query.sort){
								case 'top':
									sortCriteria = {'meta.hearts': -1};
									break;
								case 'old':
									sortCriteria = {date: +1};
									break;
								default:
									sortCriteria = {date: -1}
							}
							Comment.find({quoteId: req.params.id}).sort(sortCriteria).limit(10).then(function(retrivedComments){
								//for each retrived comment find its author and add his name to the comment in a property called authorName
								var retrivedCommentsTwo = retrivedComments.slice() //create copy of the retrived comments array
								var length = retrivedCommentsTwo.length;
								var promises = []; //create empty array for promise objects
								if(length > 0){
									retrivedCommentsTwo.forEach(function(comment){
										promises.push(User.findOne({_id: comment.author})) //everytime push the promise object inot the promise array
									});
									Promise.all(promises).then(function(result){ //resolve all promises
										for(var i = 0; i < result.length; i++){
											retrivedCommentsTwo[i].authorName = result[i].username;
										}
										res.render('quote-preview.ejs', {
											user: req.user, 
											quote: retrivedQuote, 
											author: retrivedUser, 
											comments: retrivedCommentsTwo, 
											quoteHearted: foundQuoteHeart, 
											commentsHeartedByUser: userHeartedComments,
											commentsSubmittedByUser: userSubmittedComments,
											moment: moment,
											suggestedQuotes: resultSuggestedQuotes,
											query: req.query 
										});
									});
								}else{
									res.render('quote-preview.ejs', {
										user: req.user,
										quote: retrivedQuote,
										author: retrivedUser, 
										comments: retrivedCommentsTwo, 
										quoteHearted: foundQuoteHeart, 
										commentsHeartedByUser: userHeartedComments,
										commentsSubmittedByUser: userSubmittedComments,
										moment: moment,
										suggestedQuotes: resultSuggestedQuotes,
										query: req.query 
									});
								}
							})
						})
					})
				}else{
					var randomNumbers = [];
					while(randomNumbers.length < 5){
						var random = Math.floor(Math.random() * count);
						if (randomNumbers.indexOf(random) != -1){
							continue;
						}else{
							randomNumbers.push(random);
						}
					}
					//create empty array ==> place for promise objects
					var promisesSuggestedQuotes = [];
					for(var i = 0; i < randomNumbers.length; i++){
						//add the promise object of the retrvied quote to the array
						promisesSuggestedQuotes.push(Quote.findOne({'category': retrivedQuote.category}).skip(randomNumbers[i]));
					};
					//resolve all the promises ==> get array of suggested  quotes
					Promise.all(promisesSuggestedQuotes).then((resultSuggestedQuotes) =>{
						//decide by what to sort
						var sortCriteria = null;
						switch(req.query.sort){
							case 'top':
								sortCriteria = {'meta.hearts': -1};
								break;
							case 'old':
								sortCriteria = {date: +1};
								break;
							default:
								sortCriteria = {date: -1}
						}
						Comment.find({quoteId: req.params.id}).sort(sortCriteria).limit(10).then(function(retrivedComments){
							//for each retrived comment find its author and add his name to the comment in a property called authorName
							var retrivedCommentsTwo = retrivedComments.slice() //create copy of the retrived comments array
							var length = retrivedCommentsTwo.length;
							var promises = []; //create empty array for promise objects
							if(length > 0){
								retrivedCommentsTwo.forEach(function(comment){
									promises.push(User.findOne({_id: comment.author})) //everytime push the promise object inot the promise array
								});
								Promise.all(promises).then(function(result){ //resolve all promises
									for(var i = 0; i < result.length; i++){
										retrivedCommentsTwo[i].authorName = result[i].username;
									}
									res.render('quote-preview.ejs', {
										user: req.user, 
										quote: retrivedQuote, 
										author: retrivedUser, 
										comments: retrivedCommentsTwo, 
										quoteHearted: foundQuoteHeart, 
										commentsHeartedByUser: userHeartedComments,
										commentsSubmittedByUser: userSubmittedComments,
										moment: moment,
										suggestedQuotes: resultSuggestedQuotes,
										query: req.query 
									});
								});
							}else{
								res.render('quote-preview.ejs', {
									user: req.user,
									quote: retrivedQuote,
									author: retrivedUser, 
									comments: retrivedCommentsTwo, 
									quoteHearted: foundQuoteHeart, 
									commentsHeartedByUser: userHeartedComments,
									commentsSubmittedByUser: userSubmittedComments,
									moment: moment,
									suggestedQuotes: resultSuggestedQuotes,
									query: req.query 
								});
							}
						})
					})
				}
			})
		})
	})
});

//comment pagination
router.put('/:id/paginate', (req, res) => {
	//decide by what to sort
	var sortCriteria = null;
	switch(req.query.sort){
		case 'top':
			sortCriteria = {'meta.hearts': -1};
			break;
		case 'old':
			sortCriteria = {date: +1};
			break;
		default:
			sortCriteria = {date: -1}
	}
	var skipDest = parseInt(req.query.page) * 10;
	Comment.find({quoteId: req.params.id}).sort(sortCriteria).skip(skipDest).limit(10).then((comments) => {
		userPromises = [];
		for(var i = 0; i < comments.length; i++){
			userPromises.push(User.findOne({_id: comments[i].author}));
		}
		Promise.all(userPromises).then((users) => {
			var authors = users.map((e) => {
				const object = {};
				object.id = e._id;
				object.username = e.username
				return object
			});
			res.json({
				comments: comments,
				commentAuthors: authors,
				user: req.user
			})
		})
	})
})

//hearting quotes
router.put('/:id/heart', authCheck, function(req, res){
	var found = CheckIfHeartedQuote(req)
	//If user hasn't hearted the quote before
	if(found === false){ 
		Quote.findOne({_id: req.params.id}).then(function(retrivedQuote){
			retrivedQuote.meta.hearts++; //increment the total number of hearts on that quote by 1
			retrivedQuote.meta.heartedUsers.push({
				userId: req.user.id
			}); //add the id of the current user to the list of users who hearted this quote
			retrivedQuote.save().then(function(quote){ //save that updated quote
				User.findOne({_id: quote.userId}).then(function(author){ //find the author of the current quote
					author.meta.totalHearts++; //increment the total hearts of this author by 1
					author.save().then(function(){ //save this author
						User.findOne({_id: req.user.id}).then(function(retrivedUser){ //retrive the current user
							retrivedUser.heartedQuotes.push({ 
								quoteId: quote.id
							}); //add the hearted quote to the user's list of hearted quotes
							retrivedUser.save().then(function(data){ //save that updated user
								res.json(data)
							})
						})
					})
				})
			})
		})
	// Quote.update({_id: req.params.id}, {$inc: {'meta.hearts': 1}}).then(function(data){
	// 	res.send(data)
	// })
	}else{ //if user already hearted the quote
		Quote.findOne({_id: req.params.id}).then(function(retrivedQuote){
			retrivedQuote.meta.hearts--; //decrement the total number of hearts on that quote by 1
			//check at which position in the array of users who hearted this quote is the user's id
			var UserPosition = null;
			for(var i = 0; i < retrivedQuote.meta.heartedUsers.length; i++){
				if(retrivedQuote.meta.heartedUsers[i].userId === req.user.id){
					UserPosition = i;
					break;
				}
			}
			retrivedQuote.meta.heartedUsers.splice(UserPosition, 1); //remove the id of the current user from the list of users who hearted this quote
			retrivedQuote.save().then(function(quote){ //save that updated quote
				User.findOne({_id: quote.userId}).then(function(author){
					author.meta.totalHearts--;
					author.save().then(function(){
						User.findOne({_id: req.user.id}).then(function(retrivedUser){
							var QuotePosition = null;
							for(var i = 0; i < retrivedUser.heartedQuotes.length; i++){
								if(retrivedUser.heartedQuotes[i].quoteId === quote.id){
									QuotePosition = i;
									break;
								}		
							}
							retrivedUser.heartedQuotes.splice(QuotePosition, 1); //remove the id of quote from user's list of hearted quotes
							retrivedUser.save().then(function(data){ //save that updated user
								res.json(data)
							})
						})			
					})
				})
			})
		})	
	}
});

//posting comments
router.post('/:id/comment', authCheck, urlencodedParser, function(req, res){
	//create new comment
	new Comment({
		comment: req.body.comment,
		author: req.user.id,
		date: new Date().toISOString(),
		quoteId: req.params.id
		///save this comment to DB
	}).save().then(function(savedComment){
		//add the created comment's id to the current quote's list of child comments
		Quote.findOne({_id: req.params.id}).then(function(retrivedQuote){
			retrivedQuote.comments.push({
				commentId: savedComment.id
			})
			retrivedQuote.save().then(function(){
				//add the created comments d to the current user's list of created comments
				User.findOne({_id: req.user.id}).then(function(retrivedUser){
					retrivedUser.comments.push({
						commentId: savedComment.id
					});
					retrivedUser.save().then(function(){
						//retrive the quote's author --> add the comment to his list of otherUsersComments
						User.findOne({_id: retrivedQuote.userId}).then((quoteAuthor) => {
							quoteAuthor.otherUsersComments.push({
								commentId: savedComment.id
							});
							quoteAuthor.save().then(() => {
								res.json(quoteAuthor);
							})
						})
					})
				})
			})
		});
	})
});

//hearting comments
router.put('/:id/:commentId/heart', authCheck, function(req, res){
	var found = CheckIfHeartedComment(req)
	//If user hasn't hearted the quote before
	if(found === false){ 
		Comment.findOne({_id: req.params.commentId}).then(function(retrivedComment){
			retrivedComment.meta.hearts++; //increment the total number of hearts on that quote by 1
			retrivedComment.meta.heartedUsers.push({
				userId: req.user.id
			}); //add the id of the current user to the list of users who hearted this quote
			retrivedComment.save().then(function(comment){ //save that updated quote
				User.findOne({_id: comment.author}).then(function(author){ //find the author of the current quote
					author.meta.totalHearts++; //increment the total hearts of this author by 1
					author.save().then(function(){ //save this author
						User.findOne({_id: req.user.id}).then(function(retrivedUser){ //retrive the current user
							retrivedUser.heartedComments.push({ 
								commentId: comment.id
							}); //add the hearted quote to the user's list of hearted quotes
							retrivedUser.save().then(function(data){ //save that updated user
								res.json(data)
							})
						})
					})
				})
			})
		})
	// Quote.update({_id: req.params.id}, {$inc: {'meta.hearts': 1}}).then(function(data){
	// 	res.send(data)
	// })
	}else{ //if user already hearted the quote
		Comment.findOne({_id: req.params.commentId}).then(function(retrivedComment){
			retrivedComment.meta.hearts--; //decrement the total number of hearts on that quote by 1
			//check at which position in the array of users who hearted this quote is the user's id
			var UserPosition = null;
			for(var i = 0; i < retrivedComment.meta.heartedUsers.length; i++){
				if(retrivedComment.meta.heartedUsers[i].userId === req.user.id){
					UserPosition = i;
					break;
				}
			}
			retrivedComment.meta.heartedUsers.splice(UserPosition, 1); //remove the id of the current user from the list of users who hearted this quote
			retrivedComment.save().then(function(comment){ //save that updated quote
				User.findOne({_id: comment.author}).then(function(author){
					author.meta.totalHearts--;
					author.save().then(function(){
						User.findOne({_id: req.user.id}).then(function(retrivedUser){
							var CommentPosition = null;
							for(var i = 0; i < retrivedUser.heartedComments.length; i++){
								if(retrivedUser.heartedComments[i].commentId === comment.id){
									CommentPosition = i;
									break;
								}		
							}
							retrivedUser.heartedComments.splice(CommentPosition, 1); //remove the id of quote from user's list of hearted quotes
							retrivedUser.save().then(function(data){ //save that updated user
								res.json(data)
							})
						})			
					})
				})
			})
		})	
	}
});

//deleting comments
router.delete('/:id/:commentId/delete', commentSubmitCheck, function(req, res){
	var mainPromises = []; //create empty array for promise objects
	//remove comment id from quote's list of comments
	mainPromises.push(Quote.findOne({_id: req.params.id}).then((quote) => {
		for(var i = 0; i < quote.comments.length; i++){
			if(quote.comments[i].commentId === req.params.commentId){
				var quotePosition = i;
				break;
			}
		}
		quote.comments.splice(quotePosition, 1);
		quote.save();
	}))
	//remove from current user's list of submitted comments
	mainPromises.push(User.findOne({_id: req.user.id}).then((user) => {
		for(var i = 0; i < user.comments.length; i++){
			if(user.comments[i].commentId === req.params.commentId){
				var userPosition = i;
				break;
			}
		}
		user.comments.splice(userPosition, 1);
		user.save();
	}));

	//Don't remove comment id from all users lists' of comments that they hearted -> they still hearted it despite it doesn't exist


	//remove comment id from the quote's author's list of otherUsersComments
	mainPromises.push(Quote.findOne({_id: req.params.id}).then((retrivedQuote) => {
		User.findOne({_id: retrivedQuote.userId}).then((retrivedUser) => {
			var otherUsersComments = retrivedUser.otherUsersComments.map((e) => {
				return e.commentId;
			});
			var position = otherUsersComments.indexOf(req.params.commentId);
			//refesh the user -> if the user is the same as the quote author the operation which 
			//deletes the comment from the list of submitted comments saves(completes). This changes
			//the version of the document. This operation still has the old version of the document.
			//The versions don't match so the operation fails -->that is why we need to fetch the user again - to refresh the document's version
			User.findOne({_id: retrivedQuote.userId}).then((user) => {
				user.otherUsersComments.splice(position, 1);
				user.save()
			})
		})
	}));

	//remove comment from comment collection
	mainPromises.push(Comment.findOneAndRemove({_id: req.params.commentId}));

	//send response when all previous actions complete
	Promise.all(mainPromises).then((data) =>{
		res.json(data);
	})


})

module.exports = router;