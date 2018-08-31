var authCheck = function(req, res, next){
	//if the user isn't logged in
	if(!req.user){ 
		res.redirect('/auth/google');
	//if the user is logged in
	}else{
		next();
	}
}

module.exports = authCheck;