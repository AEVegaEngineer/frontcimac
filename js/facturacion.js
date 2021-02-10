//llamada inicial de funciones
llenarFacturas();
//llenar select de la obra social

//variables globales
var facturas;
var obrasSociales = [];
var facturaFiltrada = [];
//el resto
obtenerObrasSociales();
$('#btnReporteOS').prop('disabled', true);
$('#btnReporteInterno').click(function(){
  llenarReporteFactura();
  $('#modalPrefOsAudit').modal('show');  
});
$('#btnReporteOS').click(function(){
  llenarReporteOS();    
});
$('#btnImprimirReporteInterno').click(function(){
  console.log(facturaFiltrada);
  //document.querySelector("#modalPrefOsAudit").contentWindow.print(); 
  
  var divToPrint=document.getElementById('modalPrefOsAudit');

  var newWin=window.open('','Print-Window');

  newWin.document.open();

  newWin.document.write('<html><body onload="window.print();window.close();">'+divToPrint.innerHTML+'</body></html>');

  newWin.document.close();

  //setTimeout(function(){newWin.close();},10);

});

function llenarReporteFactura(){
  const modalFactura = $('#modalPrefOsAudit > div > div > div.modal-body');
  modalFactura.html('');

  const facts = facturaFiltrada[0].facturacions;
  //console.log(facts);
  let factsOrdenadas = [];
  //busco y guardo cada medico que hay en las facturas
  medicosEnFactura = [];
  facts.forEach(fact=> {
    if(!medicosEnFactura.includes(fact.profesionales_cuenta)){
      medicosEnFactura.push(fact.profesionales_cuenta);
    }
  });
  //console.log(medicosEnFactura);
  // por cada medico, agrupo las facturas  
  
  let contenidoReporte = '';
  medicosEnFactura.forEach(med=> {
    const practicasAgrupadasPorMedico = facts.filter(fact => fact.fK_medico_id === med.id);
    //console.log(practicasAgrupadasPorMedico);
    let totalMedico = 0.0;
    let rowsPracticas = '';
    practicasAgrupadasPorMedico.forEach(prac => {
      let tipoDoc = "";
      switch(prac.fk_paciente_tipo_documento){
        case 1:
          tipoDoc = "DNI";
          break;
        case 2:
          tipoDoc = "CARNET EXT.";
          break;
        case 3:
          tipoDoc = "RUC";
          break;
        case 4:
          tipoDoc = "PASAPORTE";
          break;
        case 5:
          tipoDoc = "P. NAC.";
          break;
        default:
          break;
      }
      totalMedico += prac.prestacion_valor;
      rowsPracticas += '<tr>'+
          '<td>'+prac.turno_fecha+'</td>'+
          '<td>'+prac.paciente_os_nombre+'</td>'+
          '<td>'+tipoDoc+' '+prac.paciente_documento +'</td>'+
          '<td>'+prac.profesionales_cuenta.nro_cuenta_interna+'</td>'+
          '<td>'+prac.orden_nro+'</td>'+
          '<td>'+prac.prestacion_codigo+'</td>'+
          '<td>'+prac.prestacion_nombre+'</td>'+
          '<td>'+prac.prestacion_valor+'</td>'+
        '</tr>';
    });
    const contenidoXMedico = '<div class="row">'+
      '<div class="col-6">'+
        '<span>Número de Carnet <strong>'+med.matricula+'</strong></span>'+
      '</div>'+
      '<div class="col-6">'+
        '<span>Profesional <strong>'+med.nombre_profesional+'</strong></span>'+
      '</div>'+
    '</div>'+
    '<div class="table-responsive">'+
      '<table class="table table-striped table-sm">'+
        '<thead>'+
          '<tr>'+                   
            '<th data-field="turno_fecha">Fecha de practica</th>'+
            '<th data-field="paciente_os_nombre">Nom Paciente</th>'+
            '<th data-field="paciente_documento">Documento</th>'+
            '<th data-field="paciente_documento">Cta. Liq.</th>'+
            '<th>Nro. Orden</th>'+
            '<th>Cod. Práctica</th>'+
            '<th>Nom. Práctica</th>'+
            '<th>Total</th>'+
          '</tr>'+
        '</thead>'+
        '<tbody>'+
          //iterar por cada practica
          rowsPracticas+
          '<tr>'+
            '<td></td>'+
            '<td></td>'+
            '<td></td>'+
            '<td></td>'+
            '<td></td>'+
            '<td></td>'+
            '<td><b>Total Profesional</b></td>'+
            '<td><b>'+totalMedico+'</b></td>'+
          '</tr>'+
        '</tbody>'+
      '</table>'+
    '</div>';
    contenidoReporte += contenidoXMedico;    
  });  
  modalFactura.append(
    '<div class="row">'+
      '<div class="col-12 col-md-12">'+
        '<div class="float-right"><p class="modal-title">Fecha: '+facturaFiltrada[0].fecha+'</p></div>'+
      '</div>'+
    '</div>'+
    contenidoReporte
  );

}

function llenarReporteOS(){
  const modalFactura = $('#modalPrefOsAudit > div > div > div.modal-body');
  modalFactura.html('');
  
  const facts = facturaFiltrada[0].facturacions;
  //console.log(facts);

  //busco y guardo cada medico que hay en las facturas
  osEnFactura = [];
  facts.forEach(fact=> {
    if(!osEnFactura.includes(fact.obras_sociale.id)){
      osEnFactura.push(fact.obras_sociale.id);
    }
  });
  console.log('osEnFactura');
  console.log(osEnFactura);
  
  const obraSocialSeleccionada = parseInt($('#selOS').val());
  console.log('obraSocialSeleccionada');
  console.log(obraSocialSeleccionada);
  
  
  if(osEnFactura.indexOf(obraSocialSeleccionada) === -1){
    swal("Sin Prácticas", "Esta factura no contiene prácticas facturadas a la obra social seleccionada", "info");
    return;
  }
  // buscar practicas de la obra social seleccionada
  const practicasDeLaOS = facts.filter(prac => prac.obras_sociale.id === obraSocialSeleccionada);
  console.log('practicasDeLaOS');
  console.log(practicasDeLaOS);

  // agrupar practicas por medico y sumar los importes para tener el total
  // imprimo totales de medicos
  //busco y guardo cada medico que hay en las facturas
  medicosEnFactura = [];
  practicasDeLaOS.forEach(prac=> {
    if(!medicosEnFactura.includes(prac.profesionales_cuenta.id)){
      medicosEnFactura.push(prac.profesionales_cuenta.id);
    }
  });
  console.log('medicosEnFactura');
  console.log(medicosEnFactura);

  practicasDeLaOS.forEach(prac=> {
    if(!medicosEnFactura.includes(prac.profesionales_cuenta.id)){
      medicosEnFactura.push(prac.profesionales_cuenta.id);
    }
  });
  let contenidoReporte = '<div class="table-responsive">'+
      '<table class="table table-striped table-sm">'+
        '<thead>'+
          '<tr>'+                   
            '<th>Matricula</th>'+
            '<th>Nombre Medico</th>'+
            '<th>Cta. Interna Liq.</th>'+
            '<th>Total</th>'+
          '</tr>'+
        '</thead>'+
        '<tbody>';
  let totalFactura = 0.0;
  medicosEnFactura.forEach(med=> {
    const pracXMed = practicasDeLaOS.filter(prac => prac.fK_medico_id === med);
    console.log('pracXMed '+med);
    console.log(pracXMed);
    const profesional = pracXMed[0].profesionales_cuenta;
    console.log('profesional');
    console.log(profesional);
    let totalMedico = 0.0;
    pracXMed.forEach(prac => {
      totalMedico += prac.prestacion_valor;
    });  
    totalFactura += totalMedico;
    contenidoReporte += '<tr>'+
            '<td>'+profesional.matricula+'</td>'+
            '<td>'+profesional.nombre_profesional+'</td>'+
            '<td>'+profesional.nro_cuenta_interna+'</td>'+
            '<td><b>'+totalMedico+'</b></td>'+
          '</tr>'; 
  });
  contenidoReporte += '<tr>'+
            '<td></td>'+
            '<td></td>'+
            '<td><b>TOTAL</b></td>'+
            '<td><b>'+totalFactura+'</b></td>'+
          '</tr>'; 
  contenidoReporte += '</tbody>'+
      '</table>'+
    '</div>';  

  modalFactura.append(
    '<div class="row">'+
      '<div class="col-12 col-md-12">'+
        '<div class="float-right"><p class="modal-title">Fecha: '+facturaFiltrada[0].fecha+'</p></div>'+
      '</div>'+
    '</div>'+
    contenidoReporte
  );
  $('#modalPrefOsAudit').modal('show');
}

function llenarFacturas(){	
	$('#tableFacturas').html("");
	$('#tableFacturas').append(
		"<thead>"+
      "<tr>"+
        "<th id='fechaFactura'>Fecha</th>"+
        "<th id='fechaPracTh'style='width: 100px'>Cantidad Prac.</th>"+
        "<th >Fecha Generación</th>"+
        "<th >Estado</th>"+
        "<th >Obra Social</th>"+
        "<th >Detalles</th>"+
      "</tr>"+
    "</thead>"+
    "<tbody>"+
    "</tbody>"
	);
  getFetchSafe("api/facturacion_gen/getAllByEstado")
  .then(data => {    
    //console.log(data);
    facturas = data;
    if('message' in data)
    {
      swal(data.message);
    } else {      
      data.forEach(function (fact) {
        var estado = "Factura sin cerrar";
        switch(fact.estado){
          case 2:
            estado = "Factura cerrada";
          case 3:
            estado = "Pendiente de pago";
          case 4:
            estado = "Pagado";
          case 5:
            estado = "Liquidado";
        }
        //console.log(fact);
  			var row = "<tr id='tr"+fact.id+"'>"
  				+"<td>"+fact.fecha+"</td>"
  				+"<td>"+fact.cantidad+"</td>"
  				+"<td>"+fact.fecha_generacion+"</td>"
  				+"<td>"+estado+"</td>"
          +"<td>"+fact.fk_obra_social+"</td>"
          +"<td><button id='btn-detalle' class='btn btn-sm btn-outline-info btn-detalle-factura'>Detalles</button></td>"
  			+"</tr>";
  			$('#tableFacturas tbody').append(row);
  		});	
      $('.btn-detalle-factura').click(function(e){
        const facturaId = $(e.currentTarget).closest( "tr" ).attr('id').replace('tr','');
        mostrarDetalleFactura(facturaId)
      });
    }
  });
  sortTable('tableFacturas',['fechaFactura','fechaPracTh']);
  
}
function obtenerObrasSociales(){
  getFetchSafe("api/admin/getAllObrasSociales")
  .then(data => {    
    //console.log(data);
    if('message' in data)
    {
      swal(data.message);
    } else {
      obrasSociales = data;
      data.forEach(campo => { 
        const nombre = campo.terceroalias+' - '+campo.tercerorazonsocial;
        $('#selOS').append('<option value="'+campo.id+'">'+nombre+'</option>');        
      });
      $('#selOS').select2({ width: '100%' });    
    }
  });
}
$('#selOS').on('change',function(){
  $('#btnReporteOS').prop('disabled', false);
});
function ordenarArray(arrayAOrdenar,byCampo){
  arrayAOrdenar.sort((a,b) => (a.byCampo > b.byCampo) ? 1 : ((b.byCampo > a.byCampo) ? -1 : 0))
}
function mostrarDetalleFactura(facturaId){

  facturaFiltrada = facturas.filter(function (fac) {
    return fac.id == facturaId;
  });
  const facts = facturaFiltrada[0].facturacions;
  //console.log(facts); 

  $('#tableDetalleFactura').html("");
  $('#tableDetalleFactura').append(
    "<thead>"+
      "<tr>"+
        "<th>Manual</th>"+
        "<th>Nombre Medico</th>"+
        "<th>Obra Social</th>"+
        "<th>Doc. Paciente</th>"+
        "<th>Nombre Paciente</th>"+
        "<th>Prestacion Cod.</th>"+
        "<th>Prestacion Nombre</th>"+
        "<th>Prestacion Valor</th>"+
      "</tr>"+
    "</thead>"+
    "<tbody>"+
    "</tbody>"
  );
  facts.forEach(function (prac) {
    const obraSocial = obrasSociales.filter(function (os) {
      return os.id == prac.fk_paciente_os_id;
    });
    //console.log(obraSocial);
    var tipoDoc = "";
    switch(prac.fk_paciente_tipo_documento){
      case 1:
        tipoDoc = "DNI";
        break;
      case 2:
        tipoDoc = "CARNET EXT.";
        break;
      case 3:
        tipoDoc = "RUC";
        break;
      case 4:
        tipoDoc = "PASAPORTE";
        break;
      case 5:
        tipoDoc = "P. NAC.";
        break;
      default:
        break;
    }
    const medicoFiltrado = medicos.filter(function (med) {
      return med.id == prac.fK_medico_id;
    });
    //console.log(medicoFiltrado);
    var row = "<tr>"
      +"<td>"+((prac.carga_manual == 1) ? 'Si' : 'No')+"</td>"
      +"<td>"+((medicoFiltrado[0] == null) ? '' : medicoFiltrado[0].nombre_profesional)+"</td>"
      +"<td>"+((obraSocial[0] == null) ? '' : obraSocial[0].terceroalias)+"</td>"
      +"<td>"+prac.paciente_documento+"</td>"
      +"<td>"+prac.paciente_os_nombre+"</td>"
      +"<td>"+prac.prestacion_codigo+"</td>"
      +"<td>"+prac.prestacion_nombre+"</td>"
      +"<td>"+prac.prestacion_valor+"</td>"
    +"</tr>";
    $('#tableDetalleFactura tbody').append(row);
  }); 
  $('#modalDetalleFactura').modal('show');
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
