const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys')
const User = require('../models/user-model');

passport.serializeUser(function(user, done){
	done(null, user.id);
});
passport.deserializeUser(function(id, done){
	User.findById(id).then(function(user){
		done(null, user)
	})
})

passport.use(new GoogleStrategy({
	clientID: keys.google.clientId,
	clientSecret: keys.google.clientSecret,
	callbackURL: '/auth/google/redirect'
}, function(accessToken, refreshToken, profile, done){
	User.findOne({googleId: profile.id}).then(function(currentUser){
		if(currentUser){
			done(null, currentUser);
		}else{
			new User({
				username: profile.displayName,
				googleId: profile.id,
				profileDescription: '',
				birthday: new Date().toISOString()
			}).save().then(function(newUser){
				done(null, newUser);
			})
		}
	})
}))