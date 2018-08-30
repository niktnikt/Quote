//display the file name on the lable when file is chosen
function getFileName(){
	var fileInput = document.getElementById('file-input');
	var fileName = fileInput.value.replace('C:\\fakepath\\', '');
	console.log(fileName)
	if(fileName === ''){
		document.getElementById('file-upload-lable').textContent = 'Upload';
	}else{
		document.getElementById('file-upload-lable').textContent = fileName;
	}
}

//when user deletes profile img
function deleteProfileImage(){
	$(document).ready(function(){
		$.ajax({
			type: 'DELETE',
			url: window.location.href + '/profile-image',
			success: function(data){
  				//do something with the data via front-end framework
  				location.reload();
  			}
  		});
	})
}
