const router = require('express').Router();
const authCheck = require('../config/auth-check.js');
const Quote = require('../models/quote-model.js');
const User = require('../models/user-model.js');
const moment = require('moment');

router.get('/profile/:id', function(req, res){
	User.findOne({_id: req.params.id}).then(function(retrivedUser){
		Quote.find({userId: retrivedUser.id}).then(function(retrivedQuotes){
			//generate array of 5 random numbers
			User.count({}).then((count) => {
				if(count > 4){
					var randomNumbers = [];
					while(randomNumbers.length < 5){
						var random = Math.floor(Math.random() * count);
						if(randomNumbers.indexOf(random) > -1){
							continue;
						}else{
							randomNumbers.push(random);
						}
					}
					var promises = [] //create empty array for promise objects
					for(var i = 0; i < 5; i++){
						//add the promise object to the promise array
						promises.push(User.findOne({}).skip(randomNumbers[i]));
					}
					Promise.all(promises).then((suggestedUsers) => {
						res.render('profile-preview.ejs', {
							user: req.user, 
							profile: retrivedUser, 
							quotes: retrivedQuotes,
							moment: moment,
							suggestedUsers: suggestedUsers
						});
					})
				}else{
					var suggestedUsers = undefined;
					res.render('profile-preview.ejs', {
						user: req.user, 
						profile: retrivedUser, 
						quotes: retrivedQuotes,
						moment: moment,
						suggestedUsers: suggestedUsers
					});
				}
			})
		})
	})
})

module.exports = router;