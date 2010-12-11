
$(document).ready(function() {
  
  $("#submit").click(function(e){
    $("#notice").slideUp(function(){
      $.getJSON("/login.json", { userid: $("#handle").val().toLowerCase(), password: $("#password").val() }, function(json){
        console.log(json);
        if (json.msg == 'success') {
          // need to refresh the page so it will load the room they want.
          window.location = window.location.origin + window.location.search.replace('?', '');
        } else {
          $("#notice").text(json.msg).slideDown();
        }
      });
    });
    return false;
  });
  
  $("#register").click(function(e){
    $("#notice").slideUp(function(){
      $.getJSON("/register.json", { userid: $("#handle").val().toLowerCase(), password: $("#password").val() }, function(json){
        $("#notice").text(json.msg).slideDown();
      });
    });
    return false;
  });
  
  $("#handle, #password").keypress(function(e){
    if(e.keyCode == 13) {
      $("#submit").click();
    } 
  });
  $('#handle').focus();
});