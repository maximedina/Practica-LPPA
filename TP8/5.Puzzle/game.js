/*jslint bitwise: true, es5: true */
(function (window, undefined) {
  "use strict";
  var canvas = null,
    ctx = null,
    lastUpdate = 0,
    lastPress = null,
    lastRelease = null,
    mouse = { x: 0, y: 0 },
    pointer = { x: 0, y: 0 },
    dragging = null,
    tapArea = null,
    draggables = [],
    grid = [],
    isFinished = false,
    i = 0,
    l = 0,
    spritesheet = new Image(),
    ancho = 200,
    alto = 300,
    solucion = false;

  function Rectangle2D(x, y, width, height, createFromTopLeft) {
    this.width = width === undefined ? 0 : width;
    this.height = height === undefined ? this.width : height;
    if (createFromTopLeft) {
      this.left = x === undefined ? 0 : x;
      this.top = y === undefined ? 0 : y;
    } else {
      this.x = x === undefined ? 0 : x;
      this.y = y === undefined ? 0 : y;
    }
  }

  Rectangle2D.prototype = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    rotation: 0,
    rotationTransition: 0,

    get x() {
      return this.left + this.width / 2;
    },
    set x(value) {
      this.left = value - this.width / 2;
    },

    get y() {
      return this.top + this.height / 2;
    },
    set y(value) {
      this.top = value - this.height / 2;
    },

    get right() {
      return this.left + this.width;
    },
    set right(value) {
      this.left = value - this.width;
    },

    get bottom() {
      return this.top + this.height;
    },
    set bottom(value) {
      this.top = value - this.height;
    },

    contains: function (rect) {
      if (rect !== undefined) {
        return (
          this.left < (rect.left || rect.x) &&
          this.right > (rect.right || rect.x) &&
          this.top < (rect.top || rect.y) &&
          this.bottom > (rect.bottom || rect.y)
        );
      }
    },

    intersects: function (rect) {
      if (rect !== undefined) {
        return (
          this.left < rect.right &&
          this.right > rect.left &&
          this.top < rect.bottom &&
          this.bottom > rect.top
        );
      }
    },

    fill: function (ctx) {
      if (ctx !== undefined) {
        ctx.fillRect(this.left, this.top, this.width, this.height);
      }
    },

    stroke: function (ctx) {
      if (ctx !== undefined) {
        ctx.strokeRect(this.left, this.top, this.width, this.height);
      }
    },

    drawImageArea: function (ctx, img, sx, sy, sw, sh) {
      if (img.width) {
        ctx.save();
        ctx.translate(this.x, this.y);
        //ctx.scale(this.scale, this.scale);
        ctx.rotate(((this.rotation + this.rotationTransition) * Math.PI) / 180);
        ctx.drawImage(
          img,
          sx,
          sy,
          sw,
          sh,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
        ctx.restore();
      } else {
        this.stroke(ctx);
      }
    },
  };

  function enableInputs() {
    document.addEventListener(
      "mousemove",
      function (evt) {
        mouse.x = evt.pageX - canvas.offsetLeft;
        mouse.y = evt.pageY - canvas.offsetTop;
      },
      false
    );

    document.addEventListener(
      "mouseup",
      function (evt) {
        lastRelease = evt.which;
      },
      false
    );

    canvas.addEventListener(
      "mousedown",
      function (evt) {
        evt.preventDefault();
        lastPress = evt.which;
      },
      false
    );

    canvas.addEventListener(
      "touchmove",
      function (evt) {
        evt.preventDefault();
        var t = evt.targetTouches;
        mouse.x = t[0].pageX - canvas.offsetLeft;
        mouse.y = t[0].pageY - canvas.offsetTop;
      },
      false
    );

    canvas.addEventListener(
      "touchstart",
      function (evt) {
        evt.preventDefault();
        lastPress = 1;
        var t = evt.targetTouches;
        mouse.x = t[0].pageX - canvas.offsetLeft;
        mouse.y = t[0].pageY - canvas.offsetTop;
      },
      false
    );

    canvas.addEventListener(
      "touchend",
      function (evt) {
        lastRelease = 1;
      },
      false
    );

    canvas.addEventListener(
      "touchcancel",
      function (evt) {
        lastRelease = 1;
      },
      false
    );
  }

  function random(max) {
    return ~~(Math.random() * max);
  }

  function getPuzzleSolved() {
    for (i = 0, l = grid.length; i < l; i += 1) {
      if (grid[i].x !== draggables[i].x || grid[i].y !== draggables[i].y) {
        return false;
      }
    }
    return true;
  }

  function paint(ctx) {
    // Clean canvas
    ctx.fillStyle = "#ccf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set default text properties
    ctx.textAlign = "center";

    // Draw grid
    //ctx.fillStyle = '#999';
    ctx.strokeStyle = "#999";
    for (i = 0, l = grid.length; i < l; i += 1) {
      grid[i].stroke(ctx);
      //ctx.fillText(i, grid[i].x, grid[i].y);
    }

    // Draw rectangles
    ctx.strokeStyle = "#00f";
    for (i = draggables.length - 1; i > -1; i -= 1) {
      /*ctx.fillStyle = '#00f';
            draggables[i].fill(ctx);
            ctx.fillStyle = '#fff';
            ctx.fillText(i, draggables[i].x, draggables[i].y);*/
      var x = i % 6,
        y = ~~(i / 6);
      draggables[i].drawImageArea(ctx, spritesheet, x * 25, y * 25, 25, 25);
    }

    // Debug tap area position
    ctx.strokeStyle = "#0f0";
    tapArea.stroke(ctx);

    // Debug pointer position
    ctx.fillStyle = "#0f0";
    ctx.fillRect(pointer.x - 1, pointer.y - 1, 2, 2);

    // Is the game finished?
    ctx.fillStyle = "#fff";
    if (isFinished) {
      ctx.fillText("Well done!", canvas.width / 2, canvas.height / 2);
    }

    if (solucion) ctx.drawImage(spritesheet, 25, canvas.height / 2 + 30);
    // Debug dragging rectangle
    //ctx.fillText('Dragging: ' + dragging, 0, 10);
  }

  function act(deltaTime) {
    // Set pointer to mouse
    pointer.x = mouse.x;
    pointer.y = mouse.y;

    // Limit pointer into canvas
    if (pointer.x < 0) {
      pointer.x = 0;
    }
    if (pointer.x > canvas.width) {
      pointer.x = canvas.width;
    }
    if (pointer.y < 0) {
      pointer.y = 0;
    }
    if (pointer.y > canvas.height) {
      pointer.y = canvas.height;
    }

    // Animate pieces rotation
    for (i = 0, l = draggables.length; i < l; i += 1) {
      if (draggables[i].rotationTransition < 0) {
        draggables[i].rotationTransition += deltaTime * 360;
        if (draggables[i].rotationTransition > 0) {
          draggables[i].rotationTransition = 0;
        }
      }
    }

    if (lastPress === 1) {
      // Check for current dragging rectangle
      for (i = 0, l = draggables.length; i < l; i += 1) {
        if (draggables[i].contains(pointer)) {
          dragging = i;
          isFinished = false;
          break;
        }
      }

      // Position tap area here
      tapArea.x = pointer.x;
      tapArea.y = pointer.y;
    }

    if (dragging !== null) {
      // Move current dragging rectangle
      draggables[dragging].x = pointer.x;
      draggables[dragging].y = pointer.y;

      if (lastRelease === 1) {
        // Rotate puzzle piece
        if (tapArea.contains(pointer)) {
          draggables[dragging].rotationTransition -= 90;
          draggables[dragging].rotation += 90;
          if (draggables[dragging].rotation >= 360) {
            draggables[dragging].rotation -= 360;
          }
        }

        // Snap draggable intro grid
        if (
          grid[dragging].contains(pointer) &&
          draggables[dragging].rotation === 0
        ) {
          draggables[dragging].x = grid[dragging].x;
          draggables[dragging].y = grid[dragging].y;
          isFinished = getPuzzleSolved();
        }

        // Release current dragging rectangle
        dragging = null;
      }
    }
  }

  function run() {
    window.requestAnimationFrame(run);

    var now = Date.now(),
      deltaTime = (now - lastUpdate) / 1000;
    if (deltaTime > 1) {
      deltaTime = 0;
    }
    lastUpdate = now;

    act(deltaTime);
    paint(ctx);

    lastPress = null;
    lastRelease = null;
  }

  function init() {
    // Get canvas and context
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = ancho;
    canvas.height = alto;

    // Load assets
    spritesheet.src = "assets/puzzle.png";

    // Create tap area
    tapArea = new Rectangle2D(0, 0, 6, 6, false);

    // Create grid and draggables
    var x = 0,
      y = 0,
      draggable = null;
    for (y = 0; y < 4; y += 1) {
      for (x = 0; x < 6; x += 1) {
        grid.push(new Rectangle2D(x * 25 + 25, y * 25 + 10, 25, 25, true));
        draggable = new Rectangle2D(
          random(canvas.width),
          random(canvas.height),
          25,
          25,
          false
        );
        draggable.rotation = random(4) * 90;
        draggables.push(draggable);
      }
    }

    // Start game
    enableInputs();
    run();
  }

  const button = document.createElement("button");
  button.type = "button";
  button.innerText = "Mostrar/Ocultar ayuda";
  button.onclick = function () {
    solucion = !solucion;
  };
  document.body.appendChild(button);

  window.addEventListener("load", init, false);
})(window);
