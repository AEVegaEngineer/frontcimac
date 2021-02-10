//obtención de datos
var facturacion = [];
var paginaEstado = 4;
var formularioActual = '';
var practicasExternasNuevaPractica = [];
var medicos = [];
var extUpd = {};

function llenarFacturacion(estado = "1"){	
  paginaEstado = estado;
	$('#tableAuditoria').html("");
	$('#tableAuditoria').append(
		"<thead>"+
      "<tr>"+
        "<th id='nroCarnetTh'>Número de Carnet</th>"+
        "<th id='fechaPracTh'style='width: 100px'>Fecha de Turno</th>"+
        "<th >Nombre del Paciente</th>"+
        "<th >DNI del Paciente</th>"+
        "<th >Obra Social</th>"+
        "<th >Nombre del Profesional</th>"+
        "<th >Tipo Práctica</th>"+
        "<th >Carga Manual</th>"+
        "<th >Marcar</th>"+
      "</tr>"+
    "</thead>"+
    "<tbody>"+
    "</tbody>"
	);
  getFetchSafe("api/facturacion/getAllFacturacion?estado="+estado)
  .then(data => {    
    //console.log(data);
    facturacion = data;
    if('message' in data)
    {
      swal(data.message);
    } else {
      data.forEach(function (fact) {
        //console.log(fact);
      	const manual = (fact.carga_manual == 1) ? "<span class='badge'>Manual</span>" : "";
        var OS;
        if(fact.obras_sociale != null) {
          OS = (fact.obras_sociale.terceroalias != "" && fact.obras_sociale.terceroalias != null) ? fact.obras_sociale.terceroalias : fact.obras_sociale.tercerorazonsocial;
        } else {
          OS = '';
        }		  
  			var row = "<tr id='tr"+fact.id+"'>"
  				+"<td class='tdClickable'>"+fact.profesionales_cuenta.matricula+"</td>"
  				+"<td class='tdClickable'>"+fact.turno_fecha+"</td>"
  				+"<td class='tdClickable'>"+fact.prestacion_nombre+"</td>"
  				+"<td class='tdClickable'>"+fact.paciente_documento+"</td>"
  				+"<td class='tdClickable'>"+ OS +"</td>"
  				+"<td class='tdClickable'>"+fact.profesionales_cuenta.nombre_profesional+"</td>"
  				+"<td class='tdClickable'>"+fact.prestacion_codigo+"</td>"
  				+"<td class='tdClickable'>"+manual+"</td>"
          +"<td><input type='checkbox' name='chkMark' value='"+fact.id+"'></td>"
  			+"</tr>";
  			$('#tableAuditoria tbody').append(row);
  		});	
    }
  });
  sortTable('tableAuditoria',['nroCarnetTh','fechaPracTh']);
}

$('#btnMark').click(function(){
  const checkboxes = document.querySelectorAll('input[name="chkMark"]:checked');
  let marcados = [];
  checkboxes.forEach((checkbox) => {
      marcados.push(parseInt(checkbox.value));
  });
  //console.log(marcados);
  const estado = parseInt($('#selEstadoUpdate').val());
  const body = {
    "estado":estado,
    "facturas":marcados
  };
  putFetchSafe('api/facturacion/updateEstadoPorGrupo', body)
  .then(data => {
    llenarFacturacion(paginaEstado);
    swal(data.message);
  });
});



function llenarFacturacionExterna(factExt){ 
  $('#tableFacturacionesExternas').html("");
  $('#tableFacturacionesExternas').append(
    "<thead>"+
      "<tr>"+
        "<th >Código</th>"+
        "<th >Nombre</th>"+
        "<th >Especialidad</th>"+
        "<th >Importe</th>"+
        "<th >Comentario</th>"+
        "<th >Modificar</th>"+
      "</tr>"+
    "</thead>"+
    "<tbody>"+
    "</tbody>"
  );
  factExt.forEach(function (ext) {   
    var row = "<tr id='tr"+ext.id+"'>"
      +"<td>"+((ext.codigo_practica == null) ? ext.codigo : ext.codigo_practica)+"</td>"
      +"<td>"+ext.nombre+"</td>"
      +"<td>"+((ext.especialidad_corresponde == null) ? ext.especialidad : ext.especialidad_corresponde)+"</td>"
      +"<td>"+financialInput(ext.importe)+"</td>"
      +"<td>"+ext.comentario+"</td>"
      +"<td>"
        +"<button class='btn btn-warning btn-sm btnExtUpdate' data-toggle='tooltip' title='Actualizar' id='btnExtUpdate' factid='"+parseInt($('#idFact').val())+"' extid='"+ext.id+"' ><i class='ri-edit-2-fill'></i></button>"        
      +"</td>"
    +"</tr>";
    $('#tableFacturacionesExternas tbody').append(row);
  }); 
  $('.btnExtUpdate').click(function(e){
    
    const factid = $(this).attr('factid');
    const extid = $(this).attr('extid');
    if(factid == "" || extid == "") return;
    const ExternaFiltrada = factExt.filter(function (ext) {
      return ext.id == extid && ext.fk_id_factura == factid;
    });
    const practicaExterna = ExternaFiltrada[0];    
    mostrarModalCRUDPracticaExterna("update");

    $('#inpCreateCodigoPractica').val(practicaExterna.codigo_practica);
    $('#inpCreateNombrePractica').val(practicaExterna.nombre);
    $('#inpCreateEspecialidadPractica').val(practicaExterna.especialidad_corresponde);
    $('#inpCreateImportePractica').val(practicaExterna.importe);
    $('#inpCreateComentarioPractica').val(practicaExterna.comentario);

    extUpd = {
      "factid":factid,
      "extid": extid,
      "factExt": factExt
    };



  });
}

$('#btnActualizarPracticaExterna').click(function(){
  const body = {
    "id":               extUpd.factid,
    "id_practicas_ext": extUpd.extid,
    "codigo":           $('#inpCreateCodigoPractica').val(),
    "nombre":           $('#inpCreateNombrePractica').val(),
    "especialidad":     $('#inpCreateEspecialidadPractica').val(),
    "importe":          $('#inpCreateImportePractica').val(),
    //"comentario":       $('#inpCreateComentarioPractica').val()   
  }
  //ACTUALIZAR EL OBJETO EXTUPD.EXTID Y MODIFICARLE LA PROPIEDAD DE ESTA FACTURA EXTERNA
  if($('#inpCreateComentarioPractica').val() != "")
  {
    body["comentario"] = $('#inpCreateComentarioPractica').val();
  }
  //console.log(body);
  putFetchSafe('api/facturacion/updatePracticasExt', body)
  .then(data => {
    $('#modalCRUDPracticaExterna').modal('hide');
    llenarFacturacionExterna(extUpd.factExt);
    swal(data.message);

  });
});

function reemplazarPropiedadEnArrayDeObjetos(targetObj,fakeObj,criterios){
  const datosDetalleModal = targetObj.filter(function (fac) {
    return fac.id == factId;
  });
  $.each(targetObj, function() { 
    let flag = false;

    criterios.forEach(function (criterio) {   
      if(targetObj.criterio){
        
      }
    }); 
    /*
    if (this.id === factId) {
      this.facturacion_practicas_exts.push(fakeObj);
      llenarFacturacionExterna(this.facturacion_practicas_exts);
    }
    */
  });
}

function mostrarModalCRUDPracticaExterna(createOrUpdate = "create"){
  $('#modalCRUDPracticaExterna').modal('show');
  $('.modal-backdrop').css('z-index', 1070); 
  $('#modalCtaInternaLiqui').css('z-index', 1050);
  $('#modalCRUDPracticaExterna').css('z-index', 1100);
  if(formularioActual == 'registroPractica')
  {
    $('#btnActualizarPracticaExterna').hide();
    $('#btnRegistrarPracticaExterna').hide();
    $('#btnRegistrarPracticaExternaNuevaPractica').show();
  }  else  {
    if(createOrUpdate == "create"){
      $('#btnActualizarPracticaExterna').hide();
      $('#btnRegistrarPracticaExternaNuevaPractica').hide();
      $('#btnRegistrarPracticaExterna').show();
    } else {
      $('#btnRegistrarPracticaExterna').hide();
      $('#btnRegistrarPracticaExternaNuevaPractica').hide();
      $('#btnActualizarPracticaExterna').show();
    }
  }
  
}

function guardarNuevaPractica(){
  const inpFec = $('#inpFec').val();
  const inpCodPra = parseInt($('#inpCodPra').val());
  const inpNomPac = $('#inpNomPac').val();
  const inpImpPrac = parseFloat($('#inpImpPrac').val());
  const inpCarnet = parseInt($('#inpCarnet').val());
  const body = {
    'fecha':inpFec,
    'codigo':inpCodPra,
    'nombre':inpNomPac,
    'valor':inpImpPrac,
    'servicio_id':inpCarnet,
    'externas':practicasExternasNuevaPractica,    
  };  
  //console.log(body);
  postFetchSafe('api/facturacion/createFacturacion', body)
    .then(data => {
      $('#modalCtaInternaLiqui').modal('hide');
      llenarFacturacion(paginaEstado);
      swal(data.message);

    });
}

function guardarFacturacion(){
  if(formularioActual == 'verPractica')
  {
    const idFact = parseInt($('#idFact').val());
    const estado = parseInt($('#inpEstadoActual').val());
    const body = {
      "estado":estado,
      "facturas":[idFact]
    };
    putFetchSafe('api/facturacion/updateEstadoPorGrupo', body)
    .then(data => {
      $('#modalCtaInternaLiqui').modal('hide');
      llenarFacturacion(paginaEstado);
      swal(data.message);

    });
  } else {
    const inpFecFact = $('#inpFecFact').val();
    const inpCodPra = $('#inpCodPra').val();
    const inpNomPac = $('#inpFecFact').val();
    const inpImpPrac = $('#inpImpPrac').val();
    const inpCarnet = $('#inpCarnet').val();
    const body = {
      "fecha":inpFecFact,
      "codigo":inpCodPra,
      "nombre":inpNomPac,
      "valor":inpImpPrac,
      "servicio_id":inpCarnet,
      "externas": practicasExternasNuevaPractica
    };
    postFetchSafe('api/facturacion/createFacturacion', body)
    .then(data => {
      $('#modalCtaInternaLiqui').modal('hide');
      llenarFacturacion(paginaEstado);
      swal(data.message);
    });
  }  
}

//consulta inicial al cargar la página
llenarFacturacion();
obtenerMedicos();

// inicializando eventos

$('#selEstado').on('change',function(){
  const estadoSeleccionado = $('#selEstado').val();
  if(estadoSeleccionado == 3){
    $('#btnMark, #estadoUpdateDiv2').hide();
    $('#btnFacturar').show();

  } else {
    if($('#btnMark').is(":hidden")){
      $('#btnMark, #estadoUpdateDiv2').show();
      $('#btnFacturar').hide();
    }
  }
	llenarFacturacion(estadoSeleccionado);
});
$('#btnFacturar').hide();

$('#btnFacturar').click(function(){
  const checkboxes = document.querySelectorAll('input[name="chkMark"]:checked');
  let marcados = [];
  checkboxes.forEach((checkbox) => {
      marcados.push(parseInt(checkbox.value));
  });
  const body = {
    "fecha":obtenerFechaActual(),
    "idPractica":marcados
  };
  console.log(body);  
  postFetchSafe('api/facturacion_gen/createFactura', body)
  .then(data => {
    if('message' in data)
    {
      swal(data.message);
    } else if('facturas_actualizadas' in data){ 
      console.log(data);
      swal('Facturado','Se han facturado las practicas correctamente', 'success');
      
    }
  }); 

  
});
/*
$('.tdClickable').on('click', function(event) {
  console.log("e:");
  console.log(e);
*/
$('#tableAuditoria').on('click', 'tbody tr', function(event) {
  //si es un input (checkbox) no abre modal
  formularioActual = 'verPractica';
  verificarDisabled(formularioActual);
  if(event.target.tagName.toUpperCase() == 'INPUT') return;
  
	const tr_id = event.currentTarget.id.substring(2,3);  
  $('#idFact').val(tr_id);
	const datosDetalleModal = facturacion.filter(function (fac) {
	  return fac.id == tr_id;
	});
  //console.log(datosDetalleModal);
	const fact = datosDetalleModal[0];
  const siglaOS = fact.obras_sociale.terceroalias;
  const nombreOS = fact.obras_sociale.tercerorazonsocial;
	const OS = (siglaOS != "") ? siglaOS : nombreOS;
	const estado = (fact.estado == 1) ? "Sin Auditar" : (fact.estado == 2) ? "Auditado" : (fact.estado == 3) ? "Pendiente" : "Facturado";
  
  $(this).addClass('table-primary').siblings().removeClass('table-primary');

  // Campos para la tabla Detalles
  //$('#modalDetalle').modal('show');  
  $('#modalCtaInternaLiqui').modal('show');
  $('#inpEstadoActual').val("");
  $('#detSpanSigla').text(OS);
  $('#detSpanCtaLiq').text(fact.profesionales_cuenta.id);
  $('#detSpanCodPro').text(fact.profesionales_cuenta.matricula);
  $('#detSpanImpTot').text(fact.prestacion_valor);
  $('#detSpanCodPra').text(fact.prestacion_codigo);
  $('#detSpanNomPra').text(fact.prestacion_nombre);
  $('#detSpanEstLiq').text(estado);
  $('#detSpanTurnFec').text(fact.turno_fecha);

  // Campos para el modal Cuenta Interna Liqui
  $('#inpCodObrSoc').val(fact.obras_sociale.id);
  $('#inpSigla').val(siglaOS);
  $('#inpNomOs').val(nombreOS);
  
  $('#inpFecFact').val("2020-12-31");
  $('#inpNomPac').val(fact.paciente_os_nombre);
  $('#inpNroDoc').val(fact.paciente_documento);
  // DEFINIR QUÉ TIPO DE DOCUMENTO TIENE EL PACIENTE
  $('#inpHiddenTipoDoc').val();

  $('#inpCtaIntLiq').val(fact.profesionales_cuenta.nro_cuenta_interna);
  
  $('#inpCodPra').val(fact.prestacion_codigo);
  $('#inpNomPra').val(fact.prestacion_nombre);
  $('#inpImpPrac').val(financialInput(fact.prestacion_valor));
  llenarFacturacionExterna(fact.facturacion_practicas_exts);
  let impTotal = fact.prestacion_valor;
  fact.facturacion_practicas_exts.forEach(function (fact) {   
    impTotal += fact.importe;
  }); 
  $('#inpImpTotalPract').val(financialInput(impTotal));
  
  
  $('#spanLiquidaA').html("<b>"+fact.profesionales_cuenta.nombre_profesional+"</b>");
  const turno_fecha_format = moment(fact.turno_fecha).format('YYYY-MM-DD');
  $('#inpFec').val(turno_fecha_format);
  // COLOCAR HORA REAL DEL TURNO
  $('#inpHor').val('15:45');
  $('#inpCarnet').val(fact.profesionales_cuenta.matricula);
  $('#inpOrden').val(fact.orden_nro);
  $('#h3EstadoActual').html(estado);

});
$('#btnCambiarAuditado').click(function(){
  $('#h3EstadoActual').html("Auditado");
  $('#inpEstadoActual').val("2");  
});
$('#btnCambiarPendiente').click(function(){
  $('#h3EstadoActual').html("Pendiente");
  $('#inpEstadoActual').val("3");
});
$('#btnCambiarFacturado').click(function(){
  $('#h3EstadoActual').html("Facturado");
  $('#inpEstadoActual').val("4");
});

//Modal para registrar práctica externa
$('#btnRegistrarPracticaExterna').click(function(){
  const codigo = parseInt($('#inpCreateCodigoPractica').val());
  const nombre = $('#inpCreateNombrePractica').val();
  const especialidad = $('#inpCreateEspecialidadPractica').val();
  const importe = parseFloat($('#inpCreateImportePractica').val());
  const comentario = $('#inpCreateComentarioPractica').val();
  const factId = parseInt($('#idFact').val());
  const body = {
    "id":factId,
    "codigo":codigo,
    "nombre":nombre,
    "especialidad":especialidad,
    "importe":importe,
    "comentario":comentario   
  };  
  
  postFetchSafe('api/facturacion/createPracticasExt', body)
  .then(data => {
    llenarFacturacion(paginaEstado);
    swal(data.message);
  });  
  
  const datosDetalleModal = facturacion.filter(function (fac) {
    return fac.id == factId;
  });
  const fakeObj = {
    "id":null,
    "fk_id_factura":factId,    
    "nombre":nombre,
    "codigo_practica":codigo,    
    "especialidad_corresponde":especialidad,
    "importe":importe,
    "comentario":comentario   

  };
  $.each(facturacion, function() {    
    if (this.id === factId) {
      this.facturacion_practicas_exts.push(fakeObj);
      llenarFacturacionExterna(this.facturacion_practicas_exts);
    }
  });
  $('#modalCRUDPracticaExterna').modal('hide');
  //console.log("facturación para agregarle la nueva externa");
  //console.log(facturacion);
  //const fact = datosDetalleModal[0];
  //
});

$('#btnRegistrarPracticaExternaNuevaPractica').click(function(){
  const codigo = parseInt($('#inpCreateCodigoPractica').val());
  const nombre = $('#inpCreateNombrePractica').val();
  const especialidad = $('#inpCreateEspecialidadPractica').val();
  const importe = parseFloat($('#inpCreateImportePractica').val());
  const comentario = $('#inpCreateComentarioPractica').val();
  const body = {
    "codigo":codigo,
    "nombre":nombre,
    "especialidad":especialidad,
    "importe":importe,
    "comentario":comentario   
  };
  const fakeObj = {
    "id":null,
    "fk_id_factura":null,    
    "nombre":nombre,
    "codigo_practica":codigo,    
    "especialidad_corresponde":especialidad,
    "importe":importe,
    "comentario":comentario   
  };  
  practicasExternasNuevaPractica.push(body);
  llenarFacturacionExterna(practicasExternasNuevaPractica);
  //console.log(practicasExternasNuevaPractica);
  $('#modalCRUDPracticaExterna').modal('hide');
});

// REGISTROS DE FACTURACIÓN

$('#btnRegistrarFacturacion').click(function(){  
  llenarSelectMedicos();
  practicasExternasNuevaPractica = [];
  formularioActual = 'registroPractica';
  $('#tableFacturacionesExternas').html("");
  $('#modalCtaInternaLiqui').modal('show');
  verificarDisabled(formularioActual);
  $.fn.select2.defaults.set('language', 'es');
  $('.select2').select2();
});

function obtenerMedicos(){
  getFetchSafe("api/admin/getAllDoctor")
  .then(data => {    
    medicos = data;
  });    
}

function llenarSelectMedicos(){
  medicos.forEach(function (med) {  
    //console.log(med);
    $('#selCarnet').append(
      '<option value="'+med.id+'">'+med.nombre_profesional+'</option>'
      );
  }); 
  $('#selCarnet').select2({ width: '100%' });
}

$('#selCarnet').on('change',function(){
  $('#inpCarnet').val($(this).val());
});

function verificarDisabled(form){
  if(form == 'registroPractica')
  {
    $('#inpCodObrSoc').prop('disabled', false);
    $('#inpSigla').prop('disabled', false);
    $('#inpNomOs').prop('disabled', false);
    $('#inpCodAgr').prop('disabled', false);
    $('#inpCodAlt').prop('disabled', false);
    $('#inpFecFact').prop('disabled', false);
    $('#inpNomPac').prop('disabled', false);
    $('#inpNroDoc').prop('disabled', false);
    $('#inpCtaIntLiq').prop('disabled', false);    
    $('#inpFec').prop('disabled', false);
    $('#inpHor').prop('disabled', false);
    $('#inpCarnet').prop('disabled', false);
    $('#inpOrden').prop('disabled', false);
    $('#inpCodPra').prop('disabled', false);
    $('#inpNomPra').prop('disabled', false);
    $('#inpImpPrac').prop('disabled', false);
    $('#inpImpTotalPract').prop('disabled', false);
    $('#selCarnet').prop('disabled', false);
    
    $('#inpCodObrSoc').val('');
    $('#inpSigla').val('');
    $('#inpNomOs').val('');
    $('#inpCodAgr').val('');
    $('#inpCodAlt').val('');
    $('#inpFecFact').val('');
    $('#inpNomPac').val('');
    $('#inpNroDoc').val('');
    $('#inpCtaIntLiq').val('');
    $('#inpFec').val('');
    $('#inpHor').val('');
    $('#inpCarnet').val('');
    $('#inpOrden').val('');
    $('#inpCodPra').val('');
    $('#inpNomPra').val('');
    $('#inpImpPrac').val('');
    $('#inpImpTotalPract').val('');
    
    $("#inpCodObrSocDiv").hide();
    $("#inpSiglaDiv").hide();
    $("#inpNomOsDiv").hide();
    $("#inpFecFactDiv").hide();    
    $("#inpNroDocDiv").hide();
    $("#tipoDocDiv").hide();
    $("#inpCtaIntLiqDiv").hide();
    $("#inpCtaIntLiqDiv2").hide();
    $("#inpHorDiv").hide();
    $("#inpOrdenDiv").hide();
    $("#inpNomPraDiv").hide();
    $("#inpImpTotalPractDiv").hide();
    $("#btnCambiarEstadoDiv").hide();
    $('#selCarnet').hide();
    
  }
  else
  {
    $('#inpCodObrSoc').prop('disabled', true);
    $('#inpSigla').prop('disabled', true);
    $('#inpNomOs').prop('disabled', true);
    $('#inpCodAgr').prop('disabled', true);
    $('#inpCodAlt').prop('disabled', true);
    $('#inpFecFact').prop('disabled', true);
    $('#inpNomPac').prop('disabled', true);
    $('#inpNroDoc').prop('disabled', true);
    $('#inpCtaIntLiq').prop('disabled', true);
    $('#inpFec').prop('disabled', true);
    $('#inpHor').prop('disabled', true);
    $('#inpCarnet').prop('disabled', true);
    $('#inpOrden').prop('disabled', true);
    $('#inpCodPra').prop('disabled', true);
    $('#inpNomPra').prop('disabled', true);
    $('#inpImpPrac').prop('disabled', true);
    $('#inpImpTotalPract').prop('disabled', true);
    $('#selCarnet').prop('disabled', true);

    $("#inpCodObrSocDiv").show();
    $("#inpSiglaDiv").show();
    $("#inpNomOsDiv").show();
    $("#inpFecFactDiv").show();
    $("#inpNroDocDiv").show();
    $("#tipoDocDiv").show();
    $("#inpCtaIntLiqDiv").show();
    $("#inpCtaIntLiqDiv2").show();
    $("#inpHorDiv").show();
    $("#inpOrdenDiv").show();
    $("#inpNomPraDiv").show();
    $("#inpImpTotalPractDiv").show();
    $("#btnCambiarEstadoDiv").show();
    $('#selCarnet').show();
  }
}

// FIN DE REGISTROS DE FACTURACIÓN

$("#btnGroupTipoDoc > button.btn").on("click", function(){
    alert(this.innerHTML);
});
$('#tableAuditoria').on('hidden.bs.modal', function () {
  $('#tableAuditoria tbody tr').siblings().removeClass('table-primary');
});
$('#linkPrefOsAudit').click(function(e){
  e.preventDefault();
  $('#modalPrefOsAudit').modal('show');
});
$('#btnCtaInternaLiqui').click(function(){
  $('#modalCtaInternaLiqui').modal('show');

  //console.log("se ejecuta el show")
});
$('#btnGuardar').click(function(){
  if(formularioActual == 'registroPractica')
  {
    guardarNuevaPractica();
  } else {
    guardarFacturacion();
  }  
});

$('#btnCreateExt').click(function(){
  mostrarModalCRUDPracticaExterna();
});

/*----------------------------------------------------------------------------*/
//SCRIPT PARA AJUSTAR EL Z-INDEX DE CADA MODAL QUE SE VA MOSTRANDO      
/*
$('#modalCRUDPracticaExterna').on('shown.bs.modal', function () { 
  
  
  setTimeout(function() {
    //console.log("modalCRUDPracticaExterna shown")
    
    
  },1000);
  
}); 
*/
$('#modalCRUDPracticaExterna').on('hidden.bs.modal', function () {  
  //console.log("modalCRUDPracticaExterna hidden")         
  $('.modal-backdrop').css('z-index', 1000); 
  $('#modalCtaInternaLiqui').css('z-index', 1050);
  // cuando se cierra el modal CRUD, el modal de Liquidación pierde
  // la barra de scroll porque el body piensa que ya se cerró el modal que
  // lo necesitaba y quita la clase modal-open,
  // volviendola a colocar se soluciona
  $(document.body).addClass('modal-open');
});


function financial(x){
  return x.toFixed(2).replace(".",",").replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}
function financialInput(x){
  return x.toFixed(2);
}
function sortTable(tableid,arrayThIdOrdenables){
  if(tableid != null && tableid != arrayThIdOrdenables && arrayThIdOrdenables.length > 0)
  {
    const table = $('#'+tableid);
    let headers = '';
    $.each(arrayThIdOrdenables, function(th) {    
      headers += ', #'+this;
    });
    headers = headers.replace(/^, /, '');
    $(headers)
      .wrapInner('<span title="sort this column"/>')
      .each(function(){        
        var th = $(this),
          thIndex = th.index(),
          inverse = false;      
        th.click(function(){          
            table.find('td').filter(function(){              
                return $(this).index() === thIndex;              
            }).sortElements(function(a, b){              
                return $.text([a]) > $.text([b]) ?
                    inverse ? -1 : 1
                    : inverse ? 1 : -1;              
            }, function(){              
                // parentNode is the element we want to move
                return this.parentNode;               
            });          
            inverse = !inverse;              
        });          
      });
  }
}