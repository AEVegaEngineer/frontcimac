//obtención de datos
let facturacion = [];
let paginaEstado = 4;
function llenarFacturacion(estado = "1"){	
  paginaEstado = estado;
	$('#tableAuditoria').html("");
	$('#tableAuditoria').append(
		"<thead>"+
      "<tr>"+
        "<th >Número de Carnet</th>"+
        "<th style='width: 100px'>Fecha de Turno</th>"+
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
    data.forEach(function (fact) {
    	const manual = (fact.carga_manual == 1) ? "<span class='badge'>Manual</span>" : "";
		  var OS = (fact.obras_sociale.terceroalias != "") ? fact.obras_sociale.terceroalias : fact.obras_sociale.tercerorazonsocial;
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
  });
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
      +"<td>"+ext.codigo_practica+"</td>"
      +"<td>"+ext.nombre+"</td>"
      +"<td>"+ext.especialidad_corresponde+"</td>"
      +"<td>"+financialInput(ext.importe)+"</td>"
      +"<td>"+ext.comentario+"</td>"
      +"<td>"
        +"<button class='btn btn-warning btn-sm' data-toggle='tooltip' title='Actualizar' id='btnExtUpdate' factid='"+parseInt($('#idFact').val())+"' extid='"+ext.id+"' ><i class='ri-edit-2-fill'></i></button>"        
      +"</td>"
    +"</tr>";
    $('#tableFacturacionesExternas tbody').append(row);
  }); 
  $('#btnExtUpdate').click(function(e){
    console.log($(this));
    const factid = $(this).attr('factid');
    const extid = $(this).attr('extid');
    if(factid == "" || extid == "") return;

    
    $('#modalCRUDPracticaExterna').modal('show');
  });
}


function guardarFacturacion(){
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
}

//consulta inicial al cargar la página
llenarFacturacion();

// inicializando eventos

$('#selEstado').on('change',function(){
	llenarFacturacion($('#selEstado').val());
});


/*
$('.tdClickable').on('click', function(event) {
  console.log("e:");
  console.log(e);
*/
$('#tableAuditoria').on('click', 'tbody tr', function(event) {
  //si es un input (checkbox) no abre modal
  if(event.target.tagName.toUpperCase() == 'INPUT') return;
  
	const tr_id = event.currentTarget.id.substring(2,3);  
  $('#idFact').val(tr_id);
	const datosDetalleModal = facturacion.filter(function (fac) {
	  return fac.id == tr_id;
	});
  console.log(datosDetalleModal);
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

// REGISTROS DE FACTURACIÓN

$('#btnRegistrarFacturacion').click(function(){
  $('#modalCtaInternaLiqui').modal('show');
});

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
  guardarFacturacion();
});

$('#btnCreateExt').click(function(){
  $('#modalCRUDPracticaExterna').modal('show');
  $('.modal-backdrop').css('z-index', 1070); 
  $('#modalCtaInternaLiqui').css('z-index', 1050);
  $('#modalCRUDPracticaExterna').css('z-index', 1100);
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