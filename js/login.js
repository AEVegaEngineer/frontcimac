// funcion para hacer login
function login(){
  param = {
    username: $("#username").val(),
    password: $("#password").val()
  }
  param = JSON.stringify(param);
  postJson("api/auth/signin", param, true, recibeLogin);
}
function recibeLogin(json){
  //console.log(json)
  var accessToken = json.accessToken;
  var usuario = json.username;
  var role = json.roles;

  if (accessToken != "" && typeof accessToken !== 'undefined' && accessToken !== null){    
    setSS("accessToken", accessToken);
    setSS("usuario", usuario);
    setSS("role", role);    
    window.location=("index.html");
  }
  else{
    $resultado="<div class='alert alert-danger' id='msg-loginerr'> <button type='button' class='close' data-dismiss='alert'>&times;</button> <i class=\"fas fa-edit icon-menu\"></i>&nbsp;&nbsp; <strong>Error... "+json.errorMessage+"</strong></div>"; 
    $("#msg-login").html($resultado);
    setTimeout(function() { $("#msg-loginerr").fadeOut(2000)},10000); 
    $('#username').addClass('is-invalid');
    $('#username').addClass('is-invalid');
    $("#password").focus();

  }
}
$(document).ready(function () {
  $("#username").change(function() {
    $("#password").focus();
  });
  $("#password").change(function() {
    $("#loginform").submit();
  });
  $("#password").enterKey(function () {
    login();
  })
  // eventListener para el formulario
  $("#btnRegistrar").click(function(){
    login();
  });
});