var heart = document.getElementsByClassName('heart');

//ajax for hearting quotes
for(var i = 0; i < heart.length; i++){
	heart[i].addEventListener('click', function(){
		$(document).ready(function(){
			//make sure that /comment will be before the query
			const url = new URL(location);
			url.pathname += '/heart'
			$.ajax({
				type: 'PUT',
				// url: window.location.href + '/heart',
				url: url.href,
				success: function(data){
          			//do something with the data via front-end framework
          			location.reload();
          		}
          	});
		})
	})
}

function youHaveToBeLoggedIn(){
	var p = document.getElementById('please-log-in');
	p.textContent = 'In order to leave a heart, please log in'
	setTimeout(function(){
		p.textContent = '';
	}, 2000)
}

function youHaveToBeLoggedInComment(){
	var p = document.getElementById('please-log-in-comment');
	p.textContent = 'In order to leave a comment, please log in'
	setTimeout(function(){
		p.textContent = '';
	}, 2000)
}

function emptyComment(){
	var p = document.getElementById('please-log-in-comment');
	p.textContent = 'Your comment cant be empty'
	setTimeout(function(){
		p.textContent = '';
	}, 2000)
}

//ajax for submitting comments

var commentSubmit = document.getElementById('comment-submit');

commentSubmit.addEventListener('click', function(){
	var commentMade = document.getElementById('comment-textarea').value;
	if(commentMade === ''){
		emptyComment();
	}else{
		$(document).ready(function(){
			//make sure that /comment will be before the query
			const url = new URL(location);
			url.pathname += '/comment'
			$.ajax({
				type: 'POST',
				url: url.href,
				data: {
					comment: commentMade
				},
				success: function(data){
  					//do something with the data via front-end framework
  					location.reload();
  				}
  			});
		})
	}
})

//ajax for hearting comments
var heartComment = document.getElementsByClassName('heart-comment');

for(var i = 0; i < heartComment.length; i++){
	heartComment[i].addEventListener('click', function(event){
		var elementClicked = event.target;
		var id = elementClicked.parentNode.id;
		//make sure that /comment will be before the query
		const url = new URL(location);
		url.pathname += '/' +id + '/heart'
		$(document).ready(function(){
			$.ajax({
				type: 'PUT',
				// url: window.location.href + '/' + id + '/heart',
				url: url.href,
				success: function(data){
          			//do something with the data via front-end framework
          			location.reload();
          		}
          	});
		})
	})
}

//canceling comment submition
function cancelComment(){
	var textArea = document.getElementById('comment-textarea');
	textArea.value = '';
}

//ajax for deleting comments
$(document).ready(function(){
	var deleteBtn = document.getElementsByClassName('fa-trash');
	for(var i = 0; i < deleteBtn.length; i++){
		deleteBtn[i].addEventListener('click', (event) =>{
			var elementClicked = event.target;
			var id = elementClicked.parentNode.id;
			//make sure that /comment will be before the query
			const url = new URL(location);
			url.pathname += '/' +id + '/delete'
			$.ajax({
				type: 'DELETE',
				// url: window.location.href + '/' + id + '/delete',
				url: url.href,
				success: function(data){
          			//do something with the data via front-end framework
          			location.reload();
          		}
          	});
		})
	}
});

//comment pagination
var counter = 1;
var btn = document.getElementById('show-more-btn');
//determine the number of comments under quote
var commentNumber = document.getElementById('comment-number').textContent;
var maxPages = Math.ceil(commentNumber / 10); //round up

if(btn != null){
	btn.addEventListener('click', () => {
		const url = new URL(location);
		url.pathname += '/paginate';
		if(location.search === ''){
			url.href += '?page=' + counter;
		}else{
			url.href += '&page=' + counter;
		}
		console.log(url.href)
		$(document).ready(function(){
			$.ajax({
				type: 'PUT',
				url: url.href,
				success: function(data){
					var ul = document.getElementById('comment-ul');
					data.comments.forEach((comment, i) => {
						var li = document.createElement('li');
						// set the li id to the comment id
						li.setAttribute('id', comment._id);
						
						li.innerHTML = '<h1 class = "comment-body" >' +comment.comment + '</h1>';

						//if the user is logged in
						if(data.hasOwnProperty('user') === true){
							//create arra of only the comment id's the user hearted
							commentsHeartedByUser = data.user.heartedComments.map(function(e) { return e.commentId; })
							//if user hearted the comment						
							if(commentsHeartedByUser.indexOf(comment._id) > -1){
								li.innerHTML += '<button class="heart-comment hearted-heart-comment comment-heart-css">&#10084</button>'
							}else{
								li.innerHTML += '<button class="heart-comment not-hearted-heart-comment comment-heart-css">&#10084</button>'
							}
						}else{
							li.innerHTML += '<button class="logged-out-heart-comment comment-heart-css" onclick="youHaveToBeLoggedIn()">&#10084</button>'
						}
						li.innerHTML += '<h1 class="heart-number-comment">' +comment.meta.hearts + '</h1>'
						li.innerHTML += '<a class="comment-author" href="/users/profile/' +data.commentAuthors[i].id + '">' +data.commentAuthors[i].username + '</a>';

						//if the user is logged in
						if(data.hasOwnProperty('user') === true){
							//check id comment was submitted by user
							commentsSubmittedByUser = data.user.comments.map(function(e) { return e.commentId; })
							if(commentsSubmittedByUser.indexOf(comment._id) > -1){
								li.innerHTML +='<button class="fas fa-trash delete-comment"></button>';
							}
						}
						//display the date
						li.innerHTML += '<p id="comment-date">' + moment(comment.date).fromNow() + '</p>';
						//add event listeners for hearts and comment delete

						//hearts
						li.addEventListener('click', (event) => {
							var elementClicked = event.target;
							console.log(elementClicked)
							var id = elementClicked.parentNode.id;
							//make sure that /comment will be before the query
							const url = new URL(location);
							url.pathname += '/' +id + '/heart'
							console.log(id)
							$(document).ready(function(){
								$.ajax({
									type: 'PUT',
									// url: window.location.href + '/' + id + '/heart',
									url: url.href,
									success: function(data){
										//do something with the data via front-end framework
										location.reload();
									}
								});
							})
						});

						//delete
						li.addEventListener('click', (event) => {
							var elementClicked = event.target;
							var id = elementClicked.parentNode.id;
							//make sure that /comment will be before the query
							const url = new URL(location);
							url.pathname += '/' +id + '/delete'
							$.ajax({
								type: 'DELETE',
								// url: window.location.href + '/' + id + '/delete',
								url: url.href,
								success: function(data){
									//do something with the data via front-end framework
									location.reload();
								}
							});
						});
						
						//add the li to the parent ul
						ul.appendChild(li);
					})
					counter++;
					if(maxPages <= counter){
						document.getElementById('show-more-btn').remove();
					}
				}
			})
		})
	})
}

