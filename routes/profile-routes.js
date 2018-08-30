const router = require('express').Router();
const authCheck = require('../config/auth-check.js');
const Quote = require('../models/quote-model.js');
const User = require('../models/user-model.js');
const Comment = require('../models/comment-model.js');
const Feedback = require('../models/feedback-model.js');
const multer = require('multer'); //for posting images
const fs = require('fs'); //file system --> for interacting with files
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const moment = require('moment');

//handling errors --> when file size exeeds 5MB
function error(err, req, res, next){
	errorMsg.push('Make sure your picture is smaller than 5 MB')
	next();
}

//set up multer storage
const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'assets/uploadedImages');
	},
	filename: function(req, file, cb){
		cb(null, Date.now()+ '-' + file.originalname)
	}
});

//decide which files may be ulploaded with multer
function fileFilter(req, file, cb){
	// allow thi file
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
		cb(null, true);
	}else{ //reject the file
		cb(null, false);
	}
}

// set up multer
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5 //set the max size of uploaded image in bytes
	}, 
	fileFilter: fileFilter
})

//check if the clicked quote was submitted by the user who tries to access it's edit screen
var submitCheck = function(req, res, next){
	var found = false;
	for(var i = 0; i < req.user.quotes.length; i++){
		if(req.user.quotes[i].quoteId === req.params.id){
			found = true;
			break;
		}
	}
	if(found === true){
		next();
	}else{
		res.redirect('/')
	}
}

router.get('/', authCheck, function(req, res){
	const retriveOtherComments = new Promise((resolve, reject) => {
		var commentPromises = []; //empty array for promise objects
		for(var i = 0; i < req.user.otherUsersComments.length; i++){
			//find other users comments and add to promise array
			commentPromises.push(Comment.findOne({_id: req.user.otherUsersComments[i].commentId}));
		}
		//resolve the other users comments promise array
		Promise.all(commentPromises).then((comments) => {
			var userPromises = [];
			 comments.forEach((comment) => {
			 	//for each other user comment find it's author and add him to promise array
			 	userPromises.push(User.findOne({_id: comment.author}));
			 });
			 //resolve the author promise array and add a new property to each comment equal to its author
			 Promise.all(userPromises).then((commentUsers) => {
			 	for(var i = 0; i < comments.length; i++){
					 comments[i].user = commentUsers[i];
			 	}
			 	resolve(comments);
			 })
		})
	});
	retriveOtherComments.then((comments) => {
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
		Quote.find({userId: req.user.id}).sort(sortCriteria).limit(10).then(function(quotes){
			res.render('profile.ejs', {
				user: req.user, 
				quote: quotes, 
				moment: moment,
				otherUsersComments: comments,
				query: req.query 
			});
		})
	})
});

//quote pagination
router.put('/paginate', (req, res) => {
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
	Quote.find({userId: req.user.id}).sort(sortCriteria).skip(skipDest).limit(10).then((quotes) => {
		res.json({
			quotes: quotes,
			user: req.user
		})
	})
})

//deleting quotes
router.delete('/:quoteId/delete', (req, res) => {
	var promises = [];

	//delete quote from user's list of submitted quotes
	promises.push(User.findOne({_id: req.user.id}).then((user) => {
		for(var i = 0; i < user.quotes.length; i++){
			if(user.quotes[i].quoteId === req.params.quoteId){
				var position = i;
			}else{
				continue;
			}
		}
		User.findOne({_id: user.id}).then((retrivedUser) => {
			retrivedUser.quotes.splice(position, 1);
			retrivedUser.save();
		})
	}));

	//Don't delete quote id from users' lists of hearted quotes --> they still hearted it depsite it doesn't exist anymore
 
	//remove the ids of the comments from this quote from the users lists (  comments, otherUsersSomments ) -> don't remove from heartedComments
	//remove comment from it's author's list of submitted comments
	promises.push(Quote.findOne({_id: req.params.quoteId}).then((quote) => {
		//retrive the quote's comments
		var commentPromises = [];
		for(var i = 0; i < quote.comments.length; i++){
			commentPromises.push(Comment.findOne({_id: quote.comments[i].commentId}));
		}
		return Promise.all(commentPromises).then((comments) => {
			var commentRemovePromises = [];
			comments.forEach((comment) => {
				//for each comment retrive its author
				commentRemovePromises.push(User.findOne({_id: comment.author}))
			})
			return Promise.all(commentRemovePromises).then((commentAuthors) =>  {
				let cur = Promise.resolve();
				var position = null;
				commentAuthors.forEach((commentAuthor) => {
					//for each author delete the comment id from his list of sumitted comments
					for(var i = 0; i < commentAuthor.comments.length; i++){
						if(commentAuthor.comments[i].commentId === comments[i].id){
							position = i;
							break
						}else{
							continue;
						}
					}
					cur = cur.then(() => {
						return User.findOne({_id: commentAuthor.id}).then((commentAuthor1) => {
							commentAuthor1.comments.splice(position, 1);
							return commentAuthor1.save()
						})
					})
				});
			});
		})
	}));
	//remove comment ids from the quote's author's list of otherUsersComments
	promises.push(User.findOne({_id: req.user.id}).then((user) => {
		Quote.findOne({_id: req.params.quoteId}).then((quote) => {
			//retrive the quote's comments
			var commentPromises = [];
			for(var i = 0; i < quote.comments.length; i++){
				commentPromises.push(Comment.findOne({_id: quote.comments[i].commentId}));
			}
			Promise.all(commentPromises).then((comments) => {
				comments.forEach((comment) => {
					var position = null;
					for(var i = 0; i < user.otherUsersComments.length; i++){
						if(comment.id === user.otherUsersComments[i].commentId){
							position = i;
							break;
						}else{
							continue;
						}
					}
					user.otherUsersComments.splice(position, 1)
				});
				user.save().catch((err) => {console.log(err)});
			})
		})
	}))

	// Don't remove comment id from all users lists' of comments that they hearted --> They still hearted the comments despite they dont exist any more


	Promise.all(promises).then(() => {
		//delete all comments under this quote
		Comment.find({quoteId: req.params.quoteId}).remove().then(() => {
			//delete the quote
			Quote.findOneAndRemove({_id: req.params.quoteId}).then((data) => {
				res.json(data) 
			});
		})
	});
});

//account settings page

//get the settings page
router.get('/settings', function(req, res){
res.render('settings.ejs', {
		user: req.user
	})
});

var errorMsg = []; //array for error messages that will be added here if something goes wrong
//posting new settings - main
router.post('/settings', authCheck, upload.single('thumbnail'), function(req, res, next){errorMsg = []; next()}, error, function(req, res){
	var promises = [] //empty array for promise objects
	//delete the old thumbnail from the uploadedImages folder
	promises.push(new Promise((resolve, reject) => {
		if(req.file){
			if(req.user.thumbnail != '/default-profile-picture.svg'){
				fs.unlink('./' + req.user.thumbnail, function(err){
					if(err){console.log(err)}
				})
			}
			//change the users thumbnail
			User.findOne({_id: req.user}).then((retrivedUser) => {
				retrivedUser.thumbnail = '/'+req.file.path;
				retrivedUser.save().then(() => {
					resolve()
				});
			})
		}else{
			resolve()
		}
	}));
	//changing the username
	promises.push(new Promise((resolve, reject) => {
		if(req.body.username != ''){
			User.findOne({_id: req.user.id}).then((user) => {
				user.username = req.body.username;
				user.save().then((savedUser) => {
					resolve();
				})
			})
		}else{
			resolve();
		}
	}));
	Promise.all(promises).then(() => {
		//if no errors occured
		if(errorMsg.length === 0){
			res.redirect('back');
		}else{
			User.findOne({_id: req.user.id}).then((currentUser) => { //req.user isn't updated yet
				res.render('settings.ejs', {user: currentUser, error: errorMsg})
			})
		}
	})
});

//deleting profile image
router.delete('/settings/profile-image', authCheck, function(req, res){
	//delete the old thumbnail
	if(req.user.thumbnail != '/default-profile-picture.svg'){
		fs.unlink('./' + req.user.thumbnail, function(err){
			if(err){console.log(err)}
		})
	}
	User.findOne({_id: req.user.id}).then((retrivedUser) => {
		retrivedUser.thumbnail = '/default-profile-picture.svg';
		retrivedUser.save().then((savedUser) => {
			res.json(savedUser);
		})
	})
});

//preference settings
router.get('/settings/preferences', function(req, res){
	res.render('settings-preferences.ejs', {
		user: req.user,
		backgroundColors: ['#000', '#bababa', '#4753ff'],
		fontColors: ['#fff', '#000', '#ff3d3d']
	});
});

//posting preference settings
router.post('/settings/preferences', urlencodedParser, function(req, res){
	var promises = []; //create empty array for promise objects
	//change profile description
	promises.push(new Promise((resolve, reject) => {
		if(req.body.profileDescription != ''){
			User.findOne({_id: req.user.id}).then((retrivedUser) => {
				retrivedUser.profileDescription = req.body.profileDescription;
				retrivedUser.save().then(() => {
					resolve();
				})
			})
		}else{
			resolve();
		}
	}));
	//change profile background color
	promises.push(new Promise((resolve, reject) => {
		User.findOne({_id: req.user.id}).then((currentUser) => {
			currentUser.preferences.profileBackground = req.body.profileBackground;
			currentUser.save().then(() => {
				resolve();
			})
		})
	}));
	//change profile description font color
	promises.push(new Promise((resolve, reject) => {
		User.findOne({_id: req.user.id}).then((currentUser) => {
			currentUser.preferences.profileFontColor = req.body.profileFontColor;
			currentUser.save().then(() => {
				resolve();
			})
		})
	}));
	Promise.all(promises).then(() => {
		res.redirect('back')
	});
});

//feedback
router.get('/settings/feedback', function(req, res){
	res.render('settings-feedback.ejs', {
		user: req.user,
		message: req.flash('success')
	});
});

//sending feedback
router.post('/settings/feedback', urlencodedParser, function(req, res){
	if(req.body.title === '' || req.body.body === ''){
		res.render('settings-feedback.ejs', {
			user: req.user,
			error: 'Please make sure that none of the fields are empty'
		})
	}else{
		new Feedback({
			userId: req.user.id,
			title: req.body.title,
			body: req.body.body,
			date: new Date()
		}).save().then(() => {
			req.flash('success', 'Thanks for your submission');
			res.redirect('back');
		})
	}
})

module.exports = router;