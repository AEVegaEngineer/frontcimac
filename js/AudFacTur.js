//console.log("carga ok");
function obtenerTurnos(){	
  getJsonSafe("api/turnos/getAllByState?estado=4", null, true, recibeTurnos);
}
function recibeTurnos(json){
	//console.log(json);
	json.forEach(function (practica) {
		//console.log(practica.medico_matricula)
		var matricula = (practica.medico_matricula == null) ? "" : practica.medico_matricula.toString();
		//console.log(matricula);
		
		var row = "<tr>"
				+"<td>"+practica.id+"</td>"
				+"<td>"+matricula+"</td>"
				+"<td>"+practica.turno_fecha+"</td>"
				+"<td>"+practica.paciente_os_nombre+"</td>"
				+"<td>"+practica.paciente_documento+"</td>"
				+"<td>"+practica.paciente_os+"</td>"
				+"<td>"+practica.medico_nombre+"</td>"
				+"<td>"+practica.prestacion_codigo+"</td>"
			+"</tr>";
		$('#tableAuditoria tbody').append(row);
	});	
}
obtenerTurnos();
