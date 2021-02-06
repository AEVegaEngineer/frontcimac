//llamada inicial de funciones
llenarFacturas();

//variables globales
var facturas;
var obrasSociales = [];
//el resto
obtenerObrasSociales();

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
    }
  });
}
function mostrarDetalleFactura(facturaId){

  const FacturaFiltrada = facturas.filter(function (fac) {
    return fac.id == facturaId;
  });
  const facts = FacturaFiltrada[0].facturacions;
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
  facts.forEach(function (fact) {
    const obraSocial = obrasSociales.filter(function (os) {
      return os.id == fact.fk_paciente_os_id;
    });
    //console.log(obraSocial);
    var tipoDoc = "";
    switch(fact.fk_paciente_tipo_documento){
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
      return med.id == fact.fK_medico_id;
    });
    //console.log(medicoFiltrado);
    var row = "<tr>"
      +"<td>"+((fact.carga_manual == 1) ? 'Si' : 'No')+"</td>"
      +"<td>"+((medicoFiltrado[0] == null) ? '' : medicoFiltrado[0].nombre_profesional)+"</td>"
      +"<td>"+((obraSocial[0] == null) ? '' : obraSocial[0].terceroalias)+"</td>"
      +"<td>"+fact.paciente_documento+"</td>"
      +"<td>"+fact.paciente_os_nombre+"</td>"
      +"<td>"+fact.prestacion_codigo+"</td>"
      +"<td>"+fact.prestacion_nombre+"</td>"
      +"<td>"+fact.prestacion_valor+"</td>"
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

