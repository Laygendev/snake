var animLoopHandle;
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var gameStart = false;
var died = false;
var gameWidth = 0;
var gameHeight = 0;
var xoffset = -gameWidth;
var yoffset = -gameHeight;
var KEY_ENTER = 13;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var fps = 60;

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

  socket.emit('0');
  gameStart = true;
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
    renderLoop();
  }, 1000 / fps);
}

setInterval(function()
{
  PACKETR = 0;
  PACKETE = 0;
}, 1000);

var c = document.getElementById('csv');
c.width = screenWidth;
c.height = screenHeight;
var graph = c.getContext('2d');

c.addEventListener('keydown', directionDown, false);
c.addEventListener('keyup', directionUp, false);

function directionDown(event) {
  var key = event.which || event.keyCode;
  player.d = key;
}

function directionUp(event) {
  player.d = 0;
}

function gameLoop() {
  if( gameStart ) {
    // movePlayer();
    var playerSynchro = {
      0: player.d,
      // 1: player[1],
      // 3: player[3],
    };
    PACKETE += objectSize(JSON.stringify(playerSynchro));
    socket.emit('5', JSON.stringify(playerSynchro));
  }

  setTimeout(gameLoop, 1000 / fps);
}

gameLoop();

function renderLoop() {
  graph.fillStyle = '#f2fbff';
  graph.fillRect(0, 0, screenWidth, screenHeight);


  if (gameStart) {
    graph.fillStyle = 'black';
    graph.font = "15px Arial";

    graph.fillText("R : " + PACKETR + " o/s - E : " + PACKETE + " o/s", 20, 20);

    // movePlayer();
    drawGrid();
    drawBorder();
    // drawFoods();
    drawUsers();


    // socket.emit('5', playerSynchro);
  }
}

function movePlayer() {
  if (player.d == KEY_LEFT) {
    player.a -= player.sa;
  }
  if (player.d == KEY_RIGHT) {
    player.a += player.sa;
  }

  player[0] += player.s * Math.cos(player.a * Math.PI / 180);
  player[1] += player.s * Math.sin(player.a * Math.PI / 180);

  if(player[3]!=undefined)
    users[player[3]] = player;
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

function drawGrid() {
   graph.lineWidth = 1;
   graph.strokeStyle = 'black';
   graph.globalAlpha = 0.15;
   graph.beginPath();

  for (var x = xoffset - player[0]; x < screenWidth; x += screenHeight / 18) {
    graph.moveTo(x, 0);
    graph.lineTo(x, screenHeight);
  }

  for (var y = yoffset - player[1]; y < screenHeight; y += screenHeight / 18 ) {
    graph.moveTo(0, y);
    graph.lineTo(screenWidth, y);
  }

  graph.stroke();
  graph.globalAlpha = 1;
}

function drawBorder() {
  graph.lineWidth = 1;
 graph.strokeStyle = 'black';

 if (player[0] <= screenWidth/2) {
   graph.beginPath();
   graph.moveTo(screenWidth/2 - player[0], 0 ? player[1] > screenHeight/2 : screenHeight/2 - player[1]);
   graph.lineTo(screenWidth/2 - player[0], gameHeight + screenHeight/2 - player[1]);
   graph.strokeStyle = "black";
   graph.stroke();
 }

 if (player[1] <= screenHeight/2) {
   graph.beginPath();
   graph.moveTo(0 ? player[0] > screenWidth/2 : screenWidth/2 - player[0], screenHeight/2 - player[1]);
   graph.lineTo(gameWidth + screenWidth/2 - player[0], screenHeight/2 - player[1]);
   graph.strokeStyle = "black";
   graph.stroke();
 }

 if (gameWidth - player[0] <= screenWidth/2) {
   graph.beginPath();
   graph.moveTo(gameWidth + screenWidth/2 - player[0], screenHeight/2 - player[1]);
   graph.lineTo(gameWidth + screenWidth/2 - player[0], gameHeight + screenHeight/2 - player[1]);
   graph.strokeStyle = "black";
   graph.stroke();
 }

 if (gameHeight - player[1] <= screenHeight/2) {
   graph.beginPath();
   graph.moveTo(gameWidth + screenWidth/2 - player[0], gameHeight + screenHeight/2 - player[1]);
   graph.lineTo(screenWidth/2 - player[0], gameHeight + screenHeight/2 - player[1]);
   graph.strokeStyle = "black";
   graph.stroke();
 }
}

function drawFoods() {
  graph.strokeStyle = 'black';
  graph.fillStyle = 'orange';
  graph.lineWidth = 1;

  for ( var key in foods ) {
    drawCircle(foods[key].x - player[0] + screenWidth / 2, foods[key].y -  player[1] + screenHeight / 2, 10, 5);
  }
}

function drawUsers() {
  info();

  for (var key in users) {
    drawUser(users[key]);
  }
}

function drawUser(user) {
  var start = {
    x: player[0] - (screenWidth / 2),
    y: player[1] - (screenHeight / 2)
  };

  var x = 0;
  var y = 0;
  var lastX = 0;
  var lastY = 0;


  var headX = user[0] - start.x;
  var headY = user[1] - start.y;

  headX = valueInRange(-user[0] - player[0] + screenWidth/2, gameWidth - user[0] + gameWidth - player[0] + screenWidth/2, headX);
  headY = valueInRange(-user[1] - player[1] + screenHeight/2, gameHeight - user[1] + gameHeight - player[1] + screenHeight/2 , headY);
  graph.lineWidth = 2;
  graph.strokeStyle = '#003300';

  graph.fillStyle = 'green';
  drawCircle( headX, headY, 10, 20 );

  // graph.fillStyle = 'red';
  // if (user.ls != undefined) {
  //   for (var i = 0; i < user.ls.length; i++) {
  //       x = user.ls[i].x - start.x;
  //       y = user.ls[i].y - start.y;
  //       x = valueInRange(-user.x - player[0] + screenWidth/2, gameWidth - user.x + gameWidth - player[0] + screenWidth/2, x);
  //       y = valueInRange(-user.y - player[1] + screenHeight/2, gameHeight - user.y + gameHeight - player[1] + screenHeight/2 , y);
  //
  //       drawCircle(x, y, 10, 20);
  //   }
  // }
}

function info() {
  graph.font = "15px Arial";

  var i = 1;
  for(var key in users) {
    graph.fillStyle = player[3] == users[key][3] ? 'red' : 'black';

    graph.fillText("_id : " + users[key][3] + "X : " + parseInt(users[key][0]) + ' Y : ' + parseInt(users[key][1]), 10, 20 + (20 * i));
    i++;
  }
}


function valueInRange(min, max, value) {
  return Math.min(max, Math.max(min, value));
}
