window.onload = function () {
  var turno = "fichaAzul";
  var botones = document.getElementsByClassName("flecha");
  for (boton of botones) {
    boton.addEventListener("click", function (e) {
      var columna = e.target.id.substring(e.target.id.length - 1);
      if (document.getElementById("celda" + columna + 1).className == "hueco") {
        var i, hueco, celda;
        for (i = 1; i < 7; i++) {
          celda = "celda" + columna + i;
          hueco = document.getElementById(celda);
          if (i == 6) {
            if (hueco.className == "hueco") {
              hueco.className = turno;
            }
          } else {
            if (hueco.className == "hueco" && document.getElementById("celda" + columna + (i + 1)).className != "hueco") {
              hueco.className = turno;
            }
          }
        }
        if (turno == "fichaAzul") {
          turno = "fichaAmarilla";
          document.getElementById("turno").style.backgroundColor = "#FFD966";
        }
        else {
          turno = "fichaAzul";
          document.getElementById("turno").style.backgroundColor = "#44546A";
        }
      }
    });
  }
};
