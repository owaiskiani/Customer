function addUser(){
    window.location.href = '/customers/add';
}
function viewUser(){
    window.location.href = '/customers/view';
}
function cancelAdd(){
    window.location.href = '/dashboard';
}
function signup(){
    window.location.href = '/signup';
}
function dashboard(){
    window.location.href = '/dashboard';
}
function cancelEdit(){
    window.location.href = '/customers/view';
}
function logout(){
    window.location.href = '/customers/login';
}


jQuery(document).ready(function($){
                setTimeout(function() {
                  $('#errorMessage').fadeOut('slow',function(){
                   $('#errorMessage').remove(); 
                  }); 
                }, 5000); 
               });