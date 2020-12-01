
function obtenerProfesionales(){	
  getJsonSafe("api/admin/getAllDoctor", null, true, recibeProfesionales);
}
function llenarComboEspecialidades(tipo = ""){	
  getFetchSafe("api/admin/getAllDoctorEspec", null)
  .then(data => {    
    $('#editProTipo').html("");
    data.forEach(function (esp) {
    	var selected = (tipo == esp.id || tipo == esp.tipo_especialidad) ? " selected " : ""
    	var option = "<option value='"+esp.id+"' "+ selected +">"+
				esp.tipo_especialidad+
				"</option>";			
    	$('#editProTipo').append(option);
		});
  });
}


function recibeProfesionales(json){
	$('#tableProfesionales').html("");
	$('#tableProfesionales').append(
			"<thead>"+
        "<tr>"+        
          "<th>Nombre</th>"+
          "<th>Tipo Profesional</th>"+
          "<th>Matricula</th>"+
          "<th>Nro Cuenta Interna</th>"+
          "<th>Opciones</th>"+
        "</tr>"+
      "</thead>"+
      "<tbody>"+
      "</tbody>"
		);
	json.forEach(function (pro) {
		//console.log(pro)
		var row = "<tr>"
				+"<td>"+pro.nombre_profesional+"</td>"
				+"<td>"+pro.tipo_profesional+"</td>"
				+"<td>"+pro.matricula+"</td>"
				+"<td>"+pro.nro_cuenta_interna+"</td>"
				+"<td><button class='btn btn-sm btn-primary editBtn' id='"+pro.id+"' >Editar</button></td>"
			+"</tr>";
		$('#tableProfesionales tbody').append(row);

	});	
	$('.editBtn').click(function(){
		var pro = json.filter(obj => {			
		  return obj.id === parseInt($(this).attr('id'))
		})
		osEditForm(pro);
	});
	
}
obtenerProfesionales();

// funcion para construir objeto de respuesta tanto para crear como para actualizar OS
function construirObjetoConsulta(tipoconsulta){
	var pro = {
		
    "nombre_profesional": $('#editProNombre').val(),
    "tipo_profesional": $('#editProTipo').val(),
    "matricula": parseInt($('#editProMatricula').val()),
    "nro_cuenta_interna": parseInt($('#editProCuentaInterna').val())
  }
	if (tipoconsulta == "actualizacion") {
		pro.id = parseInt($('#editProId').val());
	}	
	//console.log(pro);
  return pro;
}


function osEditForm(obj)
{
	var pro = obj[0];
	$('#tituloModal').text('Editar profesional');
	$('#modalCRUDProfesionales').modal('show');
	$('#editProNombre').val(pro.nombre_profesional);
	//$('#editProTipo').val(pro.tipo_profesional)
	llenarComboEspecialidades(pro.tipo_profesional);
	$('#editProMatricula').val(pro.matricula);
	$('#editProCuentaInterna').val(pro.nro_cuenta_interna);
	$('#editProId').val(pro.id);
	$('#btnProUpdate').show();
	$('#btnProStore').hide();
}
// manejo para Updates de OS

$('#btnProUpdate').click(function(){	
	var Pro = construirObjetoConsulta("actualizacion");	
	putJsonSafe("api/admin/updateDoctorById", Pro, true, validaActualizacion);
	$('#preloader').modal('show');
});

// manejo para Stores de OS
$('#btnCreateProfesional').click(function(){
	$('#tituloModal').text('Registrar un nuevo profesional');
	llenarComboEspecialidades();
	$('#modalCRUDProfesionales').modal('show');
	$('#editProNombre').val("");
	$('#editProTipo').val("");
	$('#editProMatricula').val("");
	$('#editProCuentaInterna').val("");
	$('#editProId').val("");
	$('#btnProUpdate').hide();
	$('#btnProStore').show();
});

$('#btnProStore').click(function(){	
	var pro = construirObjetoConsulta("registro");
	//console.log(pro);
	postJsonSafe("api/admin/createDoctor", pro, true, validaStore);
	
});

function validaStore(json){
	console.log(json);
	obtenerProfesionales();
	$('#preloader').modal('hide');
}
function validaActualizacion(json){
	console.log(json);
	obtenerProfesionales();
	$('#preloader').modal('hide');
}
