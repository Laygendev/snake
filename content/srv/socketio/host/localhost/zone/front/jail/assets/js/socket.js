var socket;
var users = [];
var foods = [];

var player = { i: -1, x: 50, y: 50, s: 0, a: 0, sa: 0, d: 0, l: 0, ls: [], lp: [], n: 0, w: 0, h: 0 };

function setupSocket() {
  socket.on('1', function (playerSettings) {
    var playerSettings = JSON.parse(playerSettings);
    player = playerSettings;
    player.name = playerName;
    player.screenWidth = screenWidth;
    player.screenHeight = screenHeight;
    // chat.addSystemLine('Bienvenue petit serpent!');

    socket.emit('2', player);
    gameStart = true;
    c.focus();
  } );

  socket.on('4', function(data) {
    console.log("[INFO] Game Setup");
    data = JSON.parse(data);
    gameWidth = data.w;
    gameHeight = data.h;
    player.s = data.s;
    player.sa = data.sa;
    resize();
  });

  socket.on('6', function (userData) {
    console.log("[INFO] Game Update");
    userData = JSON.parse(userData);
    // foods = JSON.parse(visibleFoods);

    for (var key in userData) {
      users[key] = userData[key];

      if (users[key].c) {
        var xoffset = player.x - users[key].x;
        var yoffset = player.y - users[key].y;
        player.x = users[key].x;
        player.y = users[key].y;
        player.xoffset = isNaN(xoffset) ? 0 : xoffset;
        player.yoffset = isNaN(yoffset) ? 0 : yoffset;
      }
    }
  });
}

window.addEventListener('resize', resize);

function resize() {
    // player.w = c.width = screenWidth = window.innerWidth;
    // player.h = c.height = screenHeight = window.innerHeight;
    //
    // if (socket != undefined)
    //   socket.emit('windowResized', { screenWidth: screenWidth, screenHeight: screenHeight });
}
