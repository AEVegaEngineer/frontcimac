console.log("obrasocial/index");
function obtenerObrasSociales(){	
  getJsonSafe("api/admin/getAllObrasSociales", null, true, recibeOS);
}
function recibeOS(json){
	//console.log(json);
	
	json.forEach(function (os) {
		//console.log(os)
		var row = "<tr>"
				+"<td>"+os.terceroalias+"</td>"
				+"<td>"+os.tercerorazonsocial+"</td>"
				+"<td><button class='btn btn-sm btn-primary editBtn' id='"+os.id+"' >Editar</button></td>"
			+"</tr>";
		$('#tableObrasSociales tbody').append(row);

	});	
	$('.editBtn').click(function(){
		var os = json.filter(obj => {
		  return obj.id === parseInt($(this).attr('id'))
		})
		osEditForm(os);
	});
}

// funcion para construir objeto de respuesta tanto para crear como para actualizar OS
function construirObjetoConsulta(tipoconsulta){
	var OS = {
		
    "sigla": $('#editOSSigla').val(),
    "razon_social": $('#editOSRazonSocial').val(),
    "cuit": parseInt($('#editOSCuit').val()),
    "tipo_responsable": parseInt($('#editOSTipoResponsable').val())
  }
	if (tipoconsulta == "actualizacion") {
		OS.id = parseInt($('#editOSId').val());
	}	
  return OS;
}

// manejo para Updates de OS

$('#btnOSUpdate').click(function(){	
	var OS = construirObjetoConsulta("actualizacion");
	console.log(OS);
	//putJsonSafe("api/admin/updateObraSocialById", OS, true, validaActualizacion);
});
function validaActualizacion(json){
	console.log(json)
}

function osEditForm(obj)
{
	var os = obj[0];
	$('#tituloModal').text('Editar Obra Social');
	console.log($('#tituloModal'));
	$('#modalCRUDObraSocial').modal('show');
	$('#editOSSigla').val(os.terceroalias)
	$('#editOSRazonSocial').val(os.tercerorazonsocial)
	$('#editOSCuit').val(os.tercerocuit)
	$('#editOSTipoResponsable').val(os.tiporesponsableivaid)
	$('#editOSId').val(os.id)
	$('#btnOSUpdate').show();
	$('#btnOSStore').hide();
}
obtenerObrasSociales();

// manejo para Stores de OS

$('#btnCreateOS').click(function(){
	$('#tituloModal').text('Registrar Nueva Obra Social');
	$('#modalCRUDObraSocial').modal('show');
	$('#editOSSigla').val("");
	$('#editOSRazonSocial').val("");
	$('#editOSCuit').val("");
	$('#editOSTipoResponsable').val("");
	$('#editOSId').val("");
	$('#btnOSUpdate').hide();
	$('#btnOSStore').show();
});

$('#btnOSStore').click(function(){	
	var OS = construirObjetoConsulta("registro");
	console.log(OS);
	postJsonSafe("api/admin/createObraSocial", OS, true, validaStore);
});

function validaStore(json){
	console.log(json)
}