//obtención de datos
let facturacion = [];
function llenarFacturacion(estado = "4"){	
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
      "</tr>"+
    "</thead>"+
    "<tbody>"+
    "</tbody>"
	);
  getFetchSafe("api/facturacion/getAllFacturacion?estado="+estado)
  .then(data => {    
    console.log(data);
    facturacion = data;
    data.forEach(function (fact) {
    	const manual = (fact.carga_manual == 1) ? "<span class='badge'>Manual</span>" : "";
		  var OS = (fact.obras_sociale.terceroalias != "") ? fact.obras_sociale.terceroalias : fact.obras_sociale.tercerorazonsocial;
			var row = "<tr id='tr"+fact.id+"'>"
				+"<td>"+fact.profesionales_cuenta.matricula+"</td>"
				+"<td>"+fact.turno_fecha+"</td>"
				+"<td>"+fact.prestacion_nombre+"</td>"
				+"<td>"+fact.paciente_documento+"</td>"
				+"<td>"+ OS +"</td>"
				+"<td>"+fact.profesionales_cuenta.nombre_profesional+"</td>"
				+"<td>"+fact.prestacion_codigo+"</td>"
				+"<td>"+manual+"</td>"
				+"</tr>";
			$('#tableAuditoria tbody').append(row);
		});	
  });
}

//consulta inicial al cargar la página
llenarFacturacion();

// inicializando eventos

$('#selEstado').on('change',function(){
	llenarFacturacion($('#selEstado').val());
});

$('#tableAuditoria').on('click', 'tbody tr', function(event) {
	const tr_id = event.currentTarget.id.substring(2,3);  
	const datosDetalleModal = facturacion.filter(function (fac) {
	  return fac.id == tr_id;
	});
	const fact = datosDetalleModal[0];
	const OS = (fact.obras_sociale.terceroalias != "") ? fact.obras_sociale.terceroalias : fact.obras_sociale.tercerorazonsocial;
	const estado = (fact.estado == 1) ? "Sin Auditar" : (fact.estado == 2) ? "Auditado" : (fact.estado == 3) ? "Pendiente" : "Facturado";
  
  $(this).addClass('table-primary').siblings().removeClass('table-primary');
  $('#modalDetalle').modal('show');  
  $('#detSpanSigla').text(OS);
  $('#detSpanCtaLiq').text(fact.profesionales_cuenta.id);
  $('#detSpanCodPro').text(fact.profesionales_cuenta.matricula);
  $('#detSpanImpTot').text(fact.prestacion_valor);
  $('#detSpanCodPra').text(fact.prestacion_codigo);
  $('#detSpanNomPra').text(fact.prestacion_nombre);
  $('#detSpanEstLiq').text(estado);
  $('#detSpanTurnFec').text(fact.turno_fecha);
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
  console.log("se ejecuta el show")
});

/*----------------------------------------------------------------------------*/
//SCRIPT PARA AJUSTAR EL Z-INDEX DE CADA MODAL QUE SE VA MOSTRANDO      
$('#modalCtaInternaLiqui').on('shown.bs.modal', function () { 
  setTimeout(function() {
    console.log("modalCtaInternaLiqui shown")
    $('#modalDetalle').css('z-index', 1050);
    $('.modal-backdrop').css('z-index', 1070); 
    $('#modalCtaInternaLiqui').css('z-index', 1100);  
  }, 50);
}); 
$('#modalCtaInternaLiqui').on('hidden.bs.modal', function () {  
  console.log("modalCtaInternaLiqui hidden")         
  $('.modal-backdrop').css('z-index', 1000); 
  $('#modalDetalle').css('z-index', 1050);
});
