window.onload = function () {
    var resultado = document.getElementById('resultado');
    var botones = document.getElementsByClassName("boton");
    for (boton of botones) {
        boton.addEventListener('click', function (e) {
            /* console.log(e.target.textContent) */
            switch (e.target.textContent) {
                case '=':
                    resultado.textContent = eval(resultado.textContent);
                    break;
                case 'C':
                    resultado.textContent = '';
                    break;
                case '+ / -':
                    resultado.textContent = -resultado.textContent;
                    break;
                case '◄':
                    resultado.textContent = resultado.textContent.slice(0, resultado.textContent.length - 1);
                    break;
                default:
                    resultado.textContent = resultado.textContent + e.target.textContent;
                    break;
            }
        });
    }
}