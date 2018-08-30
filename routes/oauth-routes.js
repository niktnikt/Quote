const router = require('express').Router();
const passport = require('passport')

router.get('/google', passport.authenticate('google', {
	scope: ['profile']
}))

router.get('/google/redirect', passport.authenticate('google'), function(req, res){
	res.redirect('/');
})

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
})

module.exports = router;