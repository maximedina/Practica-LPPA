window.onload = function () {
    var form = document.getElementById("formulario")
    form.onsubmit = function (evt) {
        evt.preventDefault()
        var nombre = form.elements['nombre'].value;
        var apellido = form.elements['apellido'].value;
        var email = form.elements['email'].value;
        var edad = form.elements['edad'].value;
        var pais = form.elements['pais'].value;
        var sexo;
        if (form.elements['sexo'][0].checked) {
            sexo = form.elements['sexo'][0].value
        }
        else if (form.elements['sexo'][1].checked) {
            sexo = form.elements['sexo'][1].value
        }
        else {
            sexo = form.elements['sexo'][2].value
        }
        var intereses = '- ';
        var i;
        for (i = 0; i < form.elements['intereses'].length; i++) {
            if (form.elements['intereses'][i].checked)
                intereses = intereses + form.elements['intereses'][i].value + ' - '
        }
        var comentario = form.elements['comentario'].value;
        var mensaje = 'Nombre: ' + nombre + '\nApellido: ' + apellido + '\nEmail: ' + email + '\nEdad: ' + edad + '\nPaís: ' + pais + '\nSexo: ' + sexo + '\nIntereses: ' + intereses + '\nComentario: ' + comentario;
        console.log(mensaje);
        alert(mensaje)
    }
}