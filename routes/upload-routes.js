const router = require('express').Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const Quote = require('../models/quote-model');
const User = require('../models/user-model');
const mongoose = require('mongoose');
const authCheck = require('../config/auth-check.js');

router.get('/', authCheck, function(req, res){
	res.render('upload.ejs', {
		user: req.user,
		message: req.flash('success')
	});
});

router.post('/', urlencodedParser, function(req, res){
	//create new quote in db
	new Quote({
		category: req.body.category.toUpperCase(),
		quote: '"' + req.body.quote + '"',
		userId: req.user.id, //save the id of the user who posted the quote
		date: new Date().toISOString() 
	}).save().then(function(quote){ //save this quote to the db
		User.findOne({_id: req.user.id}).then(function(retrivedUser){ //find the user that is currently logged in, in the db --> this user submitted the quote
			retrivedUser.quotes.push({
				quoteId: quote.id
			}); //add the created quote's id to the user's list of submitted quotes
			retrivedUser.save().then(function(){ //save the updated user
				req.flash('success', 'Your quote has been succesfully uploaded');
				res.redirect('back');
			})
		})
	});
});

router.get('/succes', authCheck, function(req, res){
	res.render('succes.ejs', {user: req.user});
})

module.exports = router;