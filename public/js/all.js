function addUser(){
    window.location.href = '/customers/add';
}
function customerList(){
    window.location.href = '/customers/view';
}
function profile(){
    window.location.href = '/customers/profile';
}
function signup(){
    window.location.href = '/signup';
}
function dashboard(){
    window.location.href = '/dashboard';
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
    $('#profilePictureArea').hover(function(){
        $('#profilePictureArea a').fadeIn(500);
        $("#profilePictureArea a").css({ display: "run-in" });
    },function(){
        $('#profilePictureArea a').fadeOut(500);
        $('#profilePictureArea a').css({ display: "none" });
    });
//    $('.chatMessageArea').scrollTop($('.chatMessageArea').attr("scrollHeight"));
//    $('#chatMessageArea').scrollTop($('#chatMessageArea')[0].scrollHeight - $('#chatMessageArea')[0].clientHeight);
    $('.privateUserMessage').scrollTop($('.privateUserMessage').attr("scrollHeight"));
    $('.privateUserMessage').scrollTop($('.privateUserMessage')[0].scrollHeight - $('.privateUserMessage')[0].clientHeight);
});

$(document).ready(function() {
    $(".imgLiquid").imgLiquid();
//    $(".chatMessageArea").scroll(0,300); 
    
});

jQuery(function() {
  jQuery('#menu-main li').each(function() {
    var href = jQuery(this).find('a').attr('href');
    if (href === window.location.pathname) {
      jQuery(this).addClass('active');
    }
  });
});


jQuery(document).ready(function(){
    $("#chatsubmit").click(function(){
        var message  = $("#message").val();
        var chatusername  = $("#chatusername").val();
        var asdf = $("#chatmessages").html();
        if(asdf === ""){
            var fullmessage = "<li><strong>"+chatusername+": </strong>"+message+"</li>";
        }else{
            fullmessage = asdf+"<li><strong>"+chatusername+": </strong>"+message+"</li>";
        }
        $("div#chatmessages").clear();
        $("div#chatmessages").html(fullmessage);
    });
});

