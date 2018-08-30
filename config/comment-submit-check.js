var commentSubmitCheck =  function (req, res, next){
	var userComments = req.user.comments.map((e) => {
		return e.commentId;
	});
	if(userComments.indexOf(req.params.commentId) != -1){
		next();
	}else{
		res.redirect('/');
	}
}
module.exports = commentSubmitCheck;