// Funcion para verificar que hay un usuario logueado
function revisaLogin(){
  var token = obtenerSS("accessToken");
  if (token == null){
    window.location=("login.html");
  }
  return false;
}
function getUsuario(){
  return usuario = obtenerSS("usuario");
}
function getRole(){
  return role = obtenerSS("role");
}

/*
function revisaSucursal(){
  var sucursal = obtenerLS("sucursal");
  if (sucursal == null){
    mostrarMensaje("Iniciando...","No hay sucursal definida. <br>Debe configurar la sucursal.","OK","irConfiguracion()");
  }
  return false;
}
*/
// Carga la pagina en el contenedor contenido
function cargarPagina(pagina, parametro){
  var parametros = {
      "parametro": parametro
  };
  var page = "views/"+pagina+".html";
  $.ajax
  ({
    async: true,
    type: "GET",
    url: page,
    data: parametros,
    cache: false,
    success: function(data)
    {

      $('#contenido').html("<script>var parametro ='"+parametro+"';</script>"+data)

    }
  });
  return false;
}
//---------------------------------------------------------------------------------------------
// Carga el menu en el div
function cargarMenu(){
  var parametros = {
    "fecha-inicio": "",
    "fecha-fin"   : "",
  };
  var page = "paginas/menu.html";
  $.ajax
  ({
    type: "POST",
    url: page,
    data: parametros,
    cache: false,
    beforeSend: function () {
      $("#c2k_menu").html('Cargando...');
    },
    success: function(data)
    {
      $('#c2k_menu').html(data)
    }
  });
  return false;
}
// funcion para cargar la pagina de configuración
function irConfiguracion(){
  cargarPagina('configuracion','');
}
//---------------------------------------------------------------------------------------------
// Funcion generica para detectar el enter en un elemento
// Especial para Combos
/*  USO:
    $("#tucampo").enterKey(function () {
        tuaccion();
    })
*/

$.fn.enterKey = function (fnc) {  
  return this.each(function () {
    $(this).keypress(function (ev) {
      var keycode = (ev.keyCode ? ev.keyCode : ev.which);
      if (keycode == '13') {
        //console.log("enter key");
        fnc.call(this, ev);
      }
    })
  })
}

//---------------------------------------------------------------------------------------------
// ordena un json
// data -> json 
// key -> campo por el que se ordena
// orden -> asc ó desc
function ordenaJSON(data, key, orden) {
    return data.sort(function (a, b) {
        var x = a[key],
        y = b[key];
        if (orden === 'asc') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        if (orden === 'desc') {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}
//---------------------------------------------------------------------------------------------
// Filtrar la lista 
function findListInJson(my_object, my_criteria){
  return my_object.filter(function(obj) {
    return Object.keys(my_criteria).every(function(c) {
      return obj[c] == my_criteria[c];
    });
  });
}
//---------------------------------------------------------------------------------------------
// Reiniciar Formulario
function resetFormulario(formulario){
    $("#"+formulario)[0].reset();
}
//---------------------------------------------------------------------------------------------
// Muestra un mensaje generico
// Titulo = Titulo que se desea mostrar
// Mensaje = contenido del Mensaje
// opciones = botones que desea Mostrar:
//    OK
//    CANCEL
//    OKCANCEL
function mostrarMensaje(titulo,mensaje,opciones,callback){
  $('#modalGeneralTitulo').html(titulo);
  $('#modalGeneralContenido').html(mensaje);
  switch(opciones){
    case "OK":
      $("#modalGeneralBtnOk").show();
      $("#modalGeneralBtnCancel").hide();
      break;
    case "CANCEL":
      $("#modalGeneralBtnOk").hide();
      $("#modalGeneralBtnCancel").show();
      break;
    case "OKCANCEL": 
      $("#modalGeneralBtnOk").show();
      $("#modalGeneralBtnCancel").show();
      break;
    default: 
      $("#modalGeneralBtnOk").hide();
      $("#modalGeneralBtnCancel").hide();
  }
  if(callback && callback!=""){
    $("#modalGeneralBtnOk").attr('onClick', callback);
  }
  $('#modalGeneral').modal('show');
}
//---------------------------------------------------------------------------------------------
// Llenar un combo desde un array
// origen = array de datos
// destino = el id del combo que recibe los datos
// id = campo que se utilizará como id en cada opcion del combo
// etiqueta = campo que se utilizará como etiqueta en cada opcion del combo
// defaultValue = valor por defecto
// defaultLabel = etiqueta por defecto
// additionalParams = array de parametros adicionales para agregar a la opción. Deben estar contenidas en el array de datos
function llenaComboFromArray(origen, destino, id, etiqueta, defaultValue, defaultLabel, additionalParams){
  if(origen.length>0){
    $("#"+destino).empty();
    if(defaultLabel){
      $("#"+destino).append('<option value="'+defaultValue+'">'+defaultLabel+'</option>');
    }
    $.each(origen, function(index, option) {
      var b=JSON.stringify(option);
      var actualOption = JSON.parse(b);
      var idDef;
      var etiquetaDef;
      if(id.indexOf(".") == -1){
        idDef = actualOption[id];        
      }
      else{
        
        var idDividido = id.split(".");
        
        var valOPcion = actualOption[idDividido[0]];
        for(i=1;i<idDividido.length; i++){
          valOPcion = valOPcion[idDividido[i]];
        }
        idDef = valOPcion;
      }
      if(etiqueta.indexOf(".") == -1){
        etiquetaDef = actualOption[etiqueta];
      }
      else{
        console.log('antes');
        var etiquetaDividido = etiqueta.split(".");
        console.log('despues');
        var etiquetaOPcion = actualOption[etiquetaDividido[0]];
        for(i=1;i<etiquetaDividido.length; i++){
          etiquetaOPcion = etiquetaOPcion[etiquetaDividido[i]];
        }
        etiquetaDef = etiquetaOPcion;
      }
      var additionalParamsArr = additionalParams.split(",")
      var addParams = "";
      if(additionalParamsArr.length>0){
        $.each(additionalParamsArr, function(indexParam, optionParam) {
          var objeto = actualOption[$.trim(optionParam)];
          if(typeof objeto == 'object'){
            objeto = JSON.stringify(objeto);
            objeto = objeto.replace(/"/g, "'");
          }
          addParams += $.trim(optionParam) + '="'+objeto +'" ';
        });          
      }
      $("#"+destino).append('<option value="'+ idDef +'" '+addParams+'>'+ etiquetaDef +'</option>');       
    });
  }
  else{
    $("#"+destino).empty();
    $("#"+destino).append('<option value="'+defaultValue+'">No hay datos en BD</option>');
  }
  convertToSelect2(destino);
}
//---------------------------------------------------------------------------------------------
// Llenar un combo 
// origen = url del servicio
// destino = el id del combo que recibe los datos
// id = campo que se utilizará como id en cada opcion del combo
// etiqueta = campo que se utilizará como etiqueta en cada opcion del combo
// defaultValue = valor por defecto
// defaultLabel = etiqueta por defecto
function llenaCombo(origen, destino, id, etiqueta, defaultValue, defaultLabel){
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    url: urlServidor+origen,
    type: "GET",
    headers: {
      "Cache-Control": "no-cache"
    },
    success: function (response)
    {
      if (response) {
          var a=JSON.stringify(response);
          var resultado=JSON.parse(a); 
          var respuesta = resultado.res;
          var contenido = resultado.object;
          var mensaje   = resultado.mensaje;
          if (respuesta == "OK"){
            $("#"+destino).empty();
            if(defaultLabel){
              $("#"+destino).append('<option value="'+defaultValue+'">'+defaultLabel+'</option>');
            }
            $.each(contenido, function(index, option) {
              var b=JSON.stringify(option);
              var actualOption = JSON.parse(b);
               $("#"+destino).append('<option value="'+ actualOption[id] +'">'+ actualOption[etiqueta] +'</option>'); 
            });
          }
          
      }
      else{
        $("#"+destino).empty();
        $("#"+destino).append('<option value="">No hay datos en BD</option>');
      }
      convertToSelect2(destino);
    }
  });
}
// función que convierte un select normal en un select2
// este tipo de select contiene un autocompletado
function convertToSelect2(destino){
  //para los select2 que usan modals, ubica su html dentro del modal padre
  if($("#"+destino).closest('div.modal').length != 0)
  {
    $("#"+destino).select2({
      dropdownParent: $("#"+destino).closest('div.modal'),
      language: "es",
      theme: 'bootstrap4'
    });
  }
  else
  {
    $("#"+destino).select2({
      language: "es",
      theme: 'bootstrap4'
    });
  }
    
  $('.select2-selection.select2-selection--single').unbind("focus");
  $('.select2-selection.select2-selection--single').on('focus', function (e) {
    if (!$('#preloader').is(':visible') && !$('#modalGeneral').is(':visible')) { 
      $(this).closest(".select2-container").siblings('select:enabled').select2('open');
    }
  });
  $("#"+destino).on("select2:open", function (e) { 
    //console.log("select2:open"); 
    $('.select2-dropdown').css('z-index',99999); 
  });
  $("#"+destino).on("select2:close", function (e) { 
    //console.log("select2:close"); 
    $('.select2-dropdown').css('z-index',0); 
  });
}
function llenaComboPromoXY(origen, destino, id, etiqueta, defaultValue, defaultLabel){
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    url: urlServidorPromo+origen,
    method: "GET",
    headers: {
      "Cache-Control": "no-cache"
    },
    success: function (response)
    {
      if (response) {
        console.log(response);
          
          var a=JSON.stringify(response);
          var resultado=JSON.parse(a); 
          var respuesta = resultado.res;
          var contenido = resultado.object;
          var mensaje   = resultado.mensaje;
          if (respuesta == "OK"){
            $("#"+destino).empty();
            if(defaultLabel){
              $("#"+destino).append('<option value="'+defaultValue+'">'+defaultLabel+'</option>');
            }
            $.each(contenido, function(index, option) {
              var b=JSON.stringify(option);
              var actualOption = JSON.parse(b);
              var idDef;
              var etiquetaDef;
              if(id.indexOf(".") == -1){
                idDef = actualOption[id];
              }
              else{
                var idDividido = id.split(".");
                var valOPcion = actualOption[idDividido[0]];
                for(i=1;i<idDividido.length; i++){
                  valOPcion = valOPcion[idDividido[i]];
                }
                idDef = valOPcion;
              }
              if(etiqueta.indexOf(".") == -1){
                etiquetaDef = actualOption[etiqueta];
              }
              else{
                var etiquetaDividido = etiqueta.split(".");
                var etiquetaOPcion = actualOption[etiquetaDividido[0]];
                for(i=1;i<etiquetaDividido.length; i++){
                  etiquetaOPcion = etiquetaOPcion[etiquetaDividido[i]];
                }
                etiquetaDef = etiquetaOPcion;
              }
              $("#"+destino).append('<option value="'+ idDef +'">'+ etiquetaDef +'</option>'); 
            });
          }
          
      }
      else{
        $("#"+destino).empty();
        $("#"+destino).append('<option value="">No hay datos en BD</option>');
      }
      convertToSelect2(destino);
    }
  });
}
//---------------------------------------------------------------------------------------------
// Llenar un combo con JSON
// JSON = JSON con la data a utlizar
// destino = el id del combo que recibe los datos
// id = campo que se utilizará como id en cada opcion del combo
// etiqueta = campo que se utilizará como etiqueta en cada opcion del combo
// defaultValue = valor por defecto
// defaultLabel = etiqueta por defecto
function llenaComboJson(json, destino, id, etiqueta, defaultValue, defaultLabel){
  $("#"+destino).empty();
  if(defaultLabel){
    $("#"+destino).append('<option value="'+defaultValue+'">'+defaultLabel+'</option>');
  }
  $.each(json, function(index, option) {
    var b=JSON.stringify(option);
    var actualOption = JSON.parse(b);
     $("#"+destino).append('<option value="'+ actualOption[id] +'">'+ actualOption[etiqueta] +'</option>'); 
  });
  convertToSelect2(destino);
}
function postJson(url, parametros, loadingScrn, callback){
    $.ajax({
      async: true,
      /*
      crossDomain: true,
      datatype: "json",
      */
      data: parametros,
      url: urlServidor+url,
      type: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      beforeSend: function () {
        if(loadingScrn==true){
          $("#preloader").modal("show");   
        }
      },
      success: function (response)
      {
        console.log("success");
        console.log(response);
        setTimeout(function() {
          if(loadingScrn==true){
            $("#preloader").modal("hide");
          }
          if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
          }
        }, 300);
      },
      error: function(httpObj, textStatus) {   
        console.log("error");
        console.log(httpObj);
        $("#preloader").modal("hide");
        if(httpObj.status==401) {
          var unauthorized = {"statusCode":401,"errorMessage":"El usuario o contraseña ingresado es incorrecto."};
          callback(unauthorized);
        } else if(httpObj.status==200){
          loginSuccess();
        } else {
          //console.log("Error general");
          var notFound = {"statusCode":404,"errorMessage":"No se ha podido hacer contácto con el servidor, si el problema persiste, por favor contácte a administración."};
          callback(notFound);
        }
        /*
        console.log("Error general");
        var unauthorized = {"statusCode":401,"errorMessage":"El usuario o contraseña ingresado es incorrecto."};
        if(httpObj.status==200){
          console.log("Exitoso pero filtrado como error");
          loginSuccess();
        } else if (httpObj.status==401) {
          console.log("Error 401");
          callback(unauthorized);
        } else {

          setTimeout(function() {
            if(loadingScrn==true){
              $("#preloader").modal("hide");
              mostrarMensaje("Conexión al Servidor",servidor+" No Responde.","OK");
            }
          }, 500);  
        }
        */      
      }
    });
  }
  function postJsonSafe(url, parametros, loadingScrn, callback){
    //console.log(obtenerSS("accessToken"));
    $.ajax({
      async: true,
      /*
      crossDomain: true,
      datatype: "json",
      */
      data: parametros,
      url: urlServidor+url,
      type: "POST",
      headers: {
        "Authorization": "Bearer "+obtenerSS("accessToken")
      },
      beforeSend: function () {
        if(loadingScrn==true){
          $("#preloader").modal("show");   
        }
      },
      success: function (response)
      {
        setTimeout(function() {
          if(loadingScrn==true){
            $("#preloader").modal("hide");
          }
          if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
          }
        }, 300);
      },
      error: function(httpObj, textStatus) {   
        var unauthorized = {"statusCode":401,"errorMessage":"El usuario o contraseña ingresado es incorrecto."};
        if(httpObj.status==200)
          loginSuccess();
        else if (httpObj.status==401)
          callback(unauthorized);
        else
        {
          setTimeout(function() {
            if(loadingScrn==true){
              $("#preloader").modal("hide");
              mostrarMensaje("Conexión al Servidor",servidor+" No Responde.","OK");
            }
          }, 500);  
        }      
      }
    });
  }
  function putJsonSafe(url, parametros, loadingScrn, callback){
    $.ajax({
      async: true,
      /*
      crossDomain: true,
      datatype: "json",
      */
      data: parametros,
      url: urlServidor+url,
      type: "PUT",
      headers: {
        "Authorization": "Bearer "+obtenerSS("accessToken")
      },
      beforeSend: function () {
        if(loadingScrn==true){
          $("#preloader").modal("show");   
        }
      },
      success: function (response)
      {
        setTimeout(function() {
          if(loadingScrn==true){
            $("#preloader").modal("hide");
          }
          if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
          }
        }, 300);
      },
      error: function(httpObj, textStatus) {   
        var unauthorized = {"statusCode":401,"errorMessage":"El usuario o contraseña ingresado es incorrecto."};
        if(httpObj.status==200)
          loginSuccess();
        else if (httpObj.status==401)
          callback(unauthorized);
        else
        {
          setTimeout(function() {
            if(loadingScrn==true){
              $("#preloader").modal("hide");
              mostrarMensaje("Conexión al Servidor",servidor+" No Responde.","OK");
            }
          }, 500);  
        }      
      }
    });
  }
//---------------------------------------------------------------------------------------------
// Obtiene un JSON del servidor
// url = el Path a consultar
// parametros = json con parametros requeridos por el path
//    ejem: parametros = {"idDepos" : deposito, "idArt" : articulo }
// LoadingScrn = true o false para mostrar pantalla de carga
// callback funcion a la que se le pasan los datos obtenidos. si no hay se muestra por consola
function getJson(url, parametros, loadingScrn, callback){
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    data: parametros,
    url: urlServidor+url,
    type: "GET",
    headers: {
      "Cache-Control": "no-cache"
    },
    beforeSend: function () {
      if(loadingScrn==true){
        $("#preloader").modal("show");   
      }
    },
    success: function (response)
    {
      setTimeout(function() {
        if(loadingScrn==true){
          $("#preloader").modal("hide");
        }
        if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
        }
      }, 300);
    },
    error: function(xhr) { // if error ocurre
      setTimeout(function() {
        if(loadingScrn==true){
          $("#preloader").modal("hide");
          mostrarMensaje("Conexión al Servidor",servidor+" No Responde.","OK");
        }
      }, 500);
    }
  });
}
function getJsonSafe(url, parametros, loadingScrn, callback){
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    data: parametros,
    url: urlServidor+url,
    type: "GET",
    headers: {
      "Cache-Control": "no-cache",
      "Authorization": "Bearer "+obtenerSS("accessToken")
    },
    beforeSend: function () {
      if(loadingScrn==true){
        $("#preloader").modal("show");   
      }
    },
    success: function (response)
    {
      setTimeout(function() {
        if(loadingScrn==true){
          $("#preloader").modal("hide");
        }
        if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
        }
      }, 300);
    },
    error: function(xhr) { // if error ocurre
      setTimeout(function() {
        if(loadingScrn==true){
          $("#preloader").modal("hide");
          mostrarMensaje("Conexión al Servidor",servidor+" No Responde.","OK");
        }
      }, 500);
    }
  });
}
function mostrarLoader() { $("#preloader").modal("show") }
function esconderLoader() { $("#preloader").modal("hide") }

async function getFetchSafe(url = ''){
  // Opciones por defecto estan marcadas con un * 
  const response = await fetch(urlServidor+url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      "Cache-Control": "no-cache",
      "Authorization": "Bearer "+obtenerSS("accessToken")
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    
  });
  return response.json(); // parses JSON response into native JavaScript objects  
  
}
//---------------------------------------------------------------------------------------------
// url = el Path a consultar
// parametros = json con parametros requeridos por el path
//    ejem: parametros = {"articulos":[{"idArt":"0128585n32","codigoB":"0128585n32","descripcion":"Articulos Varios","precioVta":10,"precioCpra":1,"idRubro":1,"idLinea":1,"idTemporada":1}]}
// LoadingScrn = true o false para mostrar pantalla de carga
// callback funcion a la que se le pasan los datos obtenidos. si no hay se muestra por consola
function actualizar(url, parametros, loadingScrn, callback){
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    data: parametros,
    contentType: "application/json",
    url: urlServidor+url,
    type: "PUT",
    headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
    beforeSend: function () {
      if(loadingScrn==true){
        $("#preloader").modal("show");   
      }
    },
    success: function (response)
    {
      setTimeout(function() {
        if(loadingScrn==true){
          $("#preloader").modal("hide");
        }
        if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
        }
      }, 300);
    },
    error: function(xhr) { // if error ocurre
        if(loadingScrn==true){
          setTimeout(function() {
            $("#preloader").modal("hide");
            mostrarMensaje("Conexión al Servidor",servidor+" No Responde.","OK");
          }, 300);
        }
    }
  });
}
function actualizarPromoXY(url, parametros, loadingScrn, callback){
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    data: parametros,
    contentType: "application/json",
    url: urlServidorPromo+url,
    type: "PUT",
    headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
    beforeSend: function () {
      if(loadingScrn==true){
        $("#preloader").modal("show");
        $(".modal-backdrop").css("z-index", "1050");
        $("#preloader").css("z-index","1051");
      }
    },
    success: function (response)
    {
      setTimeout(function() {
        if(loadingScrn==true){
          $(".modal-backdrop").css("z-index", "1040");
          $("#preloader").modal("hide");
        }
        if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
        }
      }, 300);
    },
    error: function(xhr) { // if error ocurre
        if(loadingScrn==true){
          setTimeout(function() {
            $(".modal-backdrop").css("z-index", "1040");
            $("#preloader").modal("hide");
            mostrarMensaje("Conexión al Servidor",servidorPromoXY+" No Responde<br>Opción disponible solo desde la red Interna.","OK");
          }, 300);
        }
    }
  });
}
/// Trigger para que se posicione sobre el boton OK al mostrar el mensaje generico
$(document).ready(function () {
  $('#modalGeneral').on('shown.bs.modal', function () {
    $('#modalGeneralBtnOk').trigger('focus');
  });
  // Iniciar la página: Si la pagina que se muestra no es login.html hace la verificacion de usuario
  if(window.location.pathname.indexOf("login.html") == -1){
    //verificamos el login
    revisaLogin();
    //verificamos la sursal setead    
  }
  validarLogin();
});
function validarLogin(){

}
//---------------------------------------------------------------------------------------------
// url = el Path que recibe la inserción
// parametros = json con parametros requeridos por el path
//    ejem: parametros = {"articulos":[{"idArt":"0128585n32","codigoB":"0128585n32","descripcion":"Articulos Varios","precioVta":10,"precioCpra":1,"idRubro":1,"idLinea":1,"idTemporada":1}]}
// LoadingScrn = true o false para mostrar pantalla de carga
// callback funcion a la que se le pasan los datos obtenidos. si no hay se muestra por consola
function insertar(url, parametros, loadingScrn, callback){
  //var deferred = $.Deferred();
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    data: parametros,
    contentType: "application/json",
    url: urlServidor+url,
    type: "POST",
    headers: {"X-HTTP-Method-Override": "POST"}, // X-HTTP-Method-Override set to PUT.
    beforeSend: function () {
      if(loadingScrn==true){
        $("#preloader").modal("show");   
      }
    },
    success: function (response)
    {
      setTimeout(function() {
        if(loadingScrn==true){
          $("#preloader").modal("hide");
        }
        if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
        }
      }, 300);
      //deferred.resolve();
    },
    error: function(xhr) { // if error ocurre
        if(loadingScrn==true){
          setTimeout(function() {
            $("#preloader").modal("hide");
            mostrarMensaje("Conexión al Servidor",servidor+" No Responde.","OK");
          }, 300);
        }
        //deferred.reject();
    }
  });
  //return deferred.promise();
}
function insertarPromoXY(url, parametros, loadingScrn, callback){
  //console.log(parametros);
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    data: parametros,
    contentType: "application/json",
    url: urlServidorPromo+url,
    type: "POST",
    headers: {"X-HTTP-Method-Override": "POST"}, // X-HTTP-Method-Override set to PUT.
    beforeSend: function () {
      if(loadingScrn==true){
        $("#preloader").modal("show");
        $(".modal-backdrop").css("z-index", "9998");
        $("#preloader").css("z-index","9999");
      }
    },
    success: function (response)
    {
      setTimeout(function() {
        if(loadingScrn==true){
          $(".modal-backdrop").css("z-index", "1040");
          $("#preloader").modal("hide");
        }
        if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
        }
      }, 300);
    },
    error: function(xhr) { // if error ocurre
        if(loadingScrn==true){
          setTimeout(function() {
            $(".modal-backdrop").css("z-index", "1040");
            $("#preloader").modal("hide");
            mostrarMensaje("Conexión al Servidor",servidorPromoXY+" No Responde<br>Opción disponible solo desde la red Interna.","OK");
          }, 300);
        }
    }
  });
}

function deletePromoXY(url, parametros, loadingScrn, callback){
  $.ajax({
    async: true,
    crossDomain: true,
    datatype: "json",
    data: parametros,
    contentType: "application/json",
    url: urlServidorPromo+url,
    type: "DELETE",
    headers: {"X-HTTP-Method-Override": "DELETE"}, // X-HTTP-Method-Override set to PUT.
    beforeSend: function () {
      if(loadingScrn==true){
        $("#preloader").modal("show");
        $(".modal-backdrop").css("z-index", "1050");
        $("#preloader").css("z-index","1051");
      }
    },
    success: function (response)
    {
      setTimeout(function() {
        if(loadingScrn==true){
          $(".modal-backdrop").css("z-index", "1040");
          $("#preloader").modal("hide");
        }
        if (response) {
            var a=JSON.stringify(response);
            var resultado=JSON.parse(a); 
            if(callback && callback!=""){
              try{
                callback(resultado);
              }
              catch(err){
                console.log(err.message);
              }
            }
            else{
              console.log(resultado);
            }
        }
      }, 300);
    },
    error: function(xhr) { // if error ocurre
        if(loadingScrn==true){
          setTimeout(function() {
            $(".modal-backdrop").css("z-index", "1040");
            $("#preloader").modal("hide");
            mostrarMensaje("Conexión al Servidor",servidorPromoXY+" No Responde<br>Opción disponible solo desde la red Interna.","OK");
          }, 300);
        }
    }
  });
}
$(document).ready(function () {
  /// Trigger para que se posicione sobre el boton OK al mostrar el mensaje generico
  $('#modalGeneral').on('shown.bs.modal', function () {
    $('#modalGeneralBtnOk').trigger('focus');
  });
});
/// Manejo de almacenes de datos local
      /// Almacena datos en el localStorage
      function setLS(name, json){
        localStorage.setItem(name, JSON.stringify(json));
      }
      /// Consulta datos en el localStorage
      function obtenerLS(name){
        var contenido = JSON.parse(localStorage.getItem(name));
        return contenido;
      }
      /// Elimina datos en el localStorage
      function limpiarLS(){
        localStorage.clear();
      }
/// Manejo de la sessionStorage
      /// Almacena datos en el sessionStorage
      function setSS(name, json){
        sessionStorage.setItem(name, JSON.stringify(json));
      }
      /// Consulta datos en el sessionStorage
      function obtenerSS(name){
        var contenido = JSON.parse(sessionStorage.getItem(name));
        return contenido;
      }
      /// Elimina datos en el sessionStorage
      function limpiarSS(){
        sessionStorage.clear();
      }
      /// Elimina datos de la sesión del sessionStorage
      function limpiarSesion(){
        sessionStorage.removeItem("usuario");
      }
      //
      function abrirPDF(doc){
        window.open("pdf/"+doc, "_blank");
      }
/// Funcion para convertir de json a xlsx
/// xlsHeader -> los campos cabeceras
/// xlsRows -> Los registros
/// nombreArchivo -> Nombre del archivo salida
/// nombreHoja -> nombre de Hoja 
function jsonToXls(titulos, xlsHeader, xlsRows, nombreArchivo, nombreHoja){
  var createXLSLFormatObj = [];
  var margenes = [];
  $.each(titulos, function(index, value) {
    var linea = { t:'s', v: value}
    var texto = []
    texto.push(linea);
    createXLSLFormatObj.push(texto);
  });
  createXLSLFormatObj.push(xlsHeader);
  $.each(xlsRows, function(index, value) {
    var innerRowData = [];
    $.each(value, function(ind, val) {
        innerRowData.push(val);
    });
    createXLSLFormatObj.push(innerRowData);
  });
  /* File Name */
  var filename = nombreArchivo+".xlsx";
  /* Sheet Name */
  var ws_name = nombreHoja;
    
  /* crea el Workbook */
  var wb = XLSX.utils.book_new();
  /* crea el WorkSheet*/
  ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);
  /* definimos los margenes de acuerdo a la cantidad de titulos*/
  if(!ws['!merges']) ws['!merges'] = [];
  for (i=0; i<titulos.length; i++){
    var merge = { s: {r:i, c:0}, e: {r:i, c:xlsHeader.length} };
    ws['!merges'].push(merge);
  }
  /* Add worksheet to workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  /* Write workbook and Download */
  XLSX.writeFile(wb, filename);
  return false;
}
/* ---------------------------------------------------------------------------------------------
  Extrae el valor de un tag contenido en una opction de un select
  Entrada:
    select  = Control select origen
    tagName = Nombre del tag del que queremos obtener el valor
  Salida:
    Valor del tag
*/
function getTagValFromSelOption(select, tagName){
    var element = $("option:selected", select);
    var myTagVal = element.attr(tagName);    
    if(myTagVal==undefined){ myTagVal = "";}
    return myTagVal;
}
/* ---------------------------------------------------------------------------------------------
  Extrae el valor de un tag contenido en una opction de un select
  Entrada:
    select  = Control select origen
    tagName = Nombre del tag del que queremos obtener el valor
  Salida:
    Valor del tag
*/
function getTextFromSelOption(selectName){
    var select = $('#'+selectName);
    var myText = $('#'+selectName+' option:selected').text();
    if(myText==undefined || select.val()=="" || select.val()==0 ){ myText = "";}
    return myText;
}
/* funcion que mueve el foco y seleciona todo el contenido del texto */
function setFocusAndSelect(id){
  setTimeout(function() {$("#"+id).focus();$("#"+id).select(); }, 300); 
}
/* ---------------------------------------------------------------------------------------------
  Permite retardar la ejecución de un evento
  $('#agregarArticulo').keyup(delay(function (e) {
    //codigo de función a ejecutar
  }, 800));
*/
function delay(callback, ms) {
  var timer = 0;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback.apply(context, args);
    }, ms || 0);
  };
}
/* ---------------------------------------------------------------------------------------------
  Agrupa un array por un campo y suma todos los campos de la variable sumar
  Entrada:
    miarray: array que se sumará
    prop: string con criterio para agrupar
    sumar: string con los campos que se sumarán separados por comas
  Salida:
    array agrupado y sumado
*/
function groupAndSum(miarray, prop, sumar) {
  var arraySum  = sumar.split(','); 

  return miarray.reduce(function(groups, item) {
    var template = JSON.parse(JSON.stringify(item));
    var val = item[prop];
    $.each(arraySum, function(index, option) {
      template[option] = 0;
    })
    
    groups[val] = groups[val] || template;
    $.each(arraySum, function(index, option) {
      groups[val][option] += item[option];
    })
    return groups;
  }, {});  
}