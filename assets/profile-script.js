//deleting quotes
var btns = document.getElementsByClassName('fa-trash');

for(var i = 0; i < btns.length; i++){
	btns[i].addEventListener('click', (event) => {
		var btnClicked = event.target
		var id = btnClicked.parentNode.id;
		console.log(id);
		$(document).ready(function(){
			$.ajax({
				type: 'DELETE',
				url: '/profile/' + id + '/delete',
				success: function(data){
					location.reload();
				}
			})
		})
	})
}

//quote pagination
var counter = 1;
var btn = document.getElementById('show-more-btn');
//determine the number of comments under quote
var quoteNumber = document.getElementById('quote-number').textContent;
var maxPages = Math.ceil(quoteNumber / 10); //round up

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
					var ul = document.getElementById('uploaded-quotes');
					data.quotes.forEach(quote => {
						var li = document.createElement('li');
						
						//set li id to quote id
						li.setAttribute('id', quote._id);

						//add stuff to the li
						var a = document.createElement('a');
						a.setAttribute('href', '/quote/' + quote._id);

						var div = document.createElement('div');
						div.setAttribute('class', 'quote-content');
						div.innerHTML += '<h1 class="category">' + quote.category + '</h1>'
						div.innerHTML += '<p class="quote">' + quote.quote + '</p>'

						a.appendChild(div);

						li.appendChild(a);

						li.innerHTML += '<button class="fas fa-trash"></button>';
						li.innerHTML += '<p id="date">' + moment(quote.date).fromNow() + '</p>';

						//add delete event listener
						li.addEventListener('click', (event) => {
							var btnClicked = event.target
							var id = btnClicked.parentNode.id;
							console.log(id);
							$(document).ready(function(){
								$.ajax({
									type: 'DELETE',
									url: '/profile/' + id + '/delete',
									success: function(data){
										location.reload();
									}
								})
							})
						})

						ul.appendChild(li);
					});
					counter++;
					if(maxPages <= counter){
						document.getElementById('show-more-btn').remove();
					}
				}
			})
		})
	})
}