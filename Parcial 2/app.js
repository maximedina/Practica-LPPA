window.onload = async function () {
  try {
    //si existe el json en localStorage lo actualizo, sino lo cargo
    var loader = document.getElementById('loader');
    if (localStorage['empleados']) {
      loader.textContent = 'Actualizando...';
    }
    else {
      loader.textContent = 'Cargando...';
    }
    // ejecuto la promesa "fecth" que nos permite hacer una peticion HTTP y la promesa nativa "json" para formatear la respuesta a JSON
    //y lo guardo en una variable
    var response = await fetch('https://run.mocky.io/v3/11540f28-5acd-487a-867f-bf62ca4c01c4');
    var formattedResponse = await response.json();
    var employees = formattedResponse.data;
    //guardo el json en el localStorage
    localStorage.setItem('empleados', JSON.stringify(employees));
    //llamo a la funcion para llenar la tabla
    llenarTabla(employees);
  }
  catch (error) {
    //muestro el error por consola y si existe el json en localStorage lo cargo en la tabla
    console.log(error);
    var loader = document.getElementById('loader');
    if (localStorage['empleados']) {
      loader.textContent = 'Cargando...';
      var empleadosLS = localStorage.getItem('empleados');
      employees = JSON.parse(empleadosLS)
      //llamo a la funcion para llenar la tabla
      llenarTabla(employees);
    }
    else {
      loader.textContent = 'No es posible recuperar datos.';
    }
  }
}

function llenarTabla(listaEmpleados) {
  //obtengo el cuerpo de la tabla
  var cuerpo = document.getElementById('detalle');
  // recorro la lista de empleados, creo una fila de tabla por cada registro y una celda por cada atributo del json
  listaEmpleados.forEach(employee => {
    var fila = document.createElement('tr');
    fila.className = (cuerpo.childNodes.length % 2) ? '' : 'alt';
    var celda = document.createElement('td');
    celda.appendChild(document.createTextNode(employee.id));
    fila.appendChild(celda);
    celda = document.createElement('td');
    celda.appendChild(document.createTextNode(employee.employee_name));
    fila.appendChild(celda);
    celda = document.createElement('td');
    celda.appendChild(document.createTextNode(employee.employee_salary));
    fila.appendChild(celda);
    celda = document.createElement('td');
    celda.appendChild(document.createTextNode(employee.employee_age));
    fila.appendChild(celda);
    cuerpo.appendChild(fila);
    loader.style.display = 'none'
  });
}