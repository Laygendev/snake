var animLoopHandle;
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var gameStart = false;
var died = false;
var gameWidth = 0;
var gameHeight = 0;
var xoffset = -gameWidth;
var yoffset = -gameHeight;
var directionLock = 0;
var KEY_ENTER = 13;
var fps = 30;

function startGame() {
  playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '').substring(0,25);

  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  document.getElementById('startMenuWrapper').style.display = 'none';
  document.getElementById('gameAreaWrapper').style.opacity = 1;

  if (!socket) {
    socket = io();
    setupSocket();
  }

  if(!animLoopHandle)
    animLoop();

  socket.emit('respawn');
}


function validNick() {
    var regex = /^\w*$/;
    return regex.exec(playerNameInput.value) !== null;
}

window.onload = function() {
  var btn = document.getElementById('startButton'),
  nickErrorText = document.querySelector('#startMenu .input-error');

  btn.onclick = function () {

  // Checks if the nick is valid.
    if (validNick()) {
      nickErrorText.style.opacity = 0;
      startGame();
    } else {
      nickErrorText.style.opacity = 1;
    }
  };

  playerNameInput.addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;

    if (key === KEY_ENTER) {
      if (validNick()) {
        nickErrorText.style.opacity = 0;
        startGame();
      } else {
        nickErrorText.style.opacity = 1;
      }
    }
  });
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function animLoop() {
  setTimeout(function() {
    animLoopHandle = requestAnimationFrame(animLoop);
    gameLoop();
  }, 1000 / fps);
}

var c = document.getElementById('csv');
c.width = screenWidth;
c.height = screenHeight;
var graph = c.getContext('2d');

c.addEventListener('keydown', directionDown, false);
c.addEventListener('keyup', directionUp, false);

function directionDown(event) {
  var key = event.which || event.keyCode;
  directionLock = key;
}

function directionUp(event) {
  directionLock = 0;
}

function gameLoop() {
  graph.fillStyle = '#f2fbff';
  graph.fillRect(0, 0, screenWidth, screenHeight);

  drawGrid();
  drawBorder();
  drawFoods();
  drawUsers();

  if (gameStart) {
    socket.emit('0', directionLock );
  }
}

function drawCircle(centerX, centerY, radius, sides) {
  var theta = 0;
  var x = 0;
  var y = 0;

  graph.beginPath();
  for (var i = 0; i < sides; i++) {
    theta = (i / sides) * 2 * Math.PI;
    x = centerX + radius * Math.sin(theta);
    y = centerY + radius * Math.cos(theta);
    graph.lineTo(x, y);
  }
  graph.closePath();
  graph.fill();
}

function drawFoods() {

  graph.strokeStyle = 'black';
  graph.fillStyle = 'orange';
  graph.lineWidth = 1;

  for ( var key in foods ) {
    drawCircle(foods[key].x - player.x + screenWidth / 2, foods[key].y -  player.y + screenHeight / 2, 10, 5);
  }
}

function drawGrid() {
   graph.lineWidth = 1;
   graph.strokeStyle = 'black';
   graph.globalAlpha = 0.15;
   graph.beginPath();

  for (var x = xoffset - player.x; x < screenWidth; x += screenHeight / 18) {
    graph.moveTo(x, 0);
    graph.lineTo(x, screenHeight);
  }

  for (var y = yoffset - player.y; y < screenHeight; y += screenHeight / 18 ) {
    graph.moveTo(0, y);
    graph.lineTo(screenWidth, y);
  }

  graph.stroke();
  graph.globalAlpha = 1;
}

function drawBorder() {
  graph.lineWidth = 1;
  graph.strokeStyle = 'black';

  if (player.x <= screenWidth/2) {
    graph.beginPath();
    graph.moveTo(screenWidth/2 - player.x, 0 ? player.y > screenHeight/2 : screenHeight/2 - player.y);
    graph.lineTo(screenWidth/2 - player.x, gameHeight + screenHeight/2 - player.y);
    graph.strokeStyle = "black";
    graph.stroke();
  }

  if (player.y <= screenHeight/2) {
    graph.beginPath();
    graph.moveTo(0 ? player.x > screenWidth/2 : screenWidth/2 - player.x, screenHeight/2 - player.y);
    graph.lineTo(gameWidth + screenWidth/2 - player.x, screenHeight/2 - player.y);
    graph.strokeStyle = "black";
    graph.stroke();
  }

  if (gameWidth - player.x <= screenWidth/2) {
    graph.beginPath();
    graph.moveTo(gameWidth + screenWidth/2 - player.x, screenHeight/2 - player.y);
    graph.lineTo(gameWidth + screenWidth/2 - player.x, gameHeight + screenHeight/2 - player.y);
    graph.strokeStyle = "black";
    graph.stroke();
  }

  if (gameHeight - player.y <= screenHeight/2) {
    graph.beginPath();
    graph.moveTo(gameWidth + screenWidth/2 - player.x, gameHeight + screenHeight/2 - player.y);
    graph.lineTo(screenWidth/2 - player.x, gameHeight + screenHeight/2 - player.y);
    graph.strokeStyle = "black";
    graph.stroke();
  }
}

function drawUsers() {
  var start = {
      x: player.x - (screenWidth / 2),
      y: player.y - (screenHeight / 2)
  };

  for (var key in users) {
    var x = 0;
    var y = 0;
    var lastX = 0;
    var lastY = 0;

    var headX = users[key].x - start.x;
    var headY = users[key].y - start.y;

    headX = valueInRange(-users[key].x - player.x + screenWidth/2, gameWidth - users[key].x + gameWidth - player.x + screenWidth/2, headX);
    headY = valueInRange(-users[key].y - player.y + screenHeight/2, gameHeight - users[key].y + gameHeight - player.y + screenHeight/2 , headY);

    graph.lineWidth = 2;
    graph.strokeStyle = '#003300';
    graph.fillStyle = 'green';
    drawCircle( headX, headY, 10, 20 );

    graph.fillStyle = 'red';
    for( var i = 0; i < users[key].l.length; i++ ) {
        x = users[key].l[i].x - start.x;
        y = users[key].l[i].y - start.y;
        x = valueInRange(-users[key].x - player.x + screenWidth/2, gameWidth - users[key].x + gameWidth - player.x + screenWidth/2, x);
        y = valueInRange(-users[key].y - player.y + screenHeight/2, gameHeight - users[key].y + gameHeight - player.y + screenHeight/2 , y);

        drawCircle(x, y, 10, 20 );
    }
  }
}

function valueInRange(min, max, value) {
  return Math.min(max, Math.max(min, value));
}
