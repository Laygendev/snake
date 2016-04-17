var socket;
var users = [];
var foods = [];

var player = {
  id: -1,
  x: screenWidth / 2,
  y: screenHeight / 2,
  angle: 0,
  screenWidth: screenWidth,
  screenHeight: screenHeight,
};

function setupSocket() {
  socket.on('welcome', function (playerSettings) {
    player = playerSettings;
    player.name = playerName;
    player.screenWidth = screenWidth;
    player.screenHeight = screenHeight;
    chat.addSystemLine('Bienvenue petit serpent!');

    socket.emit('gotit', player);
    gameStart = true;
    c.focus();
  } );

  socket.on('gameSetup', function(data) {
    gameWidth = data.gameWidth;
    gameHeight = data.gameHeight;
    resize();
  });

  socket.on('1', function (userData, visibleFoods) {
    userData = JSON.parse(userData);
    foods = JSON.parse(visibleFoods);

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

  socket.on('2', function (data) {
    leaderboard = data.leaderboard;
    var status = '<span class="title">Classement</span>';
    for (var i = 0; i < leaderboard.length; i++) {
      status += '<br />';
      if (leaderboard[i].id == player.id){
        if(leaderboard[i].name.length !== 0)
          status += '<span class="me">' + (i + 1) + '. ' + leaderboard[i].name + " (" + leaderboard[i].score +")</span>";
        else
          status += '<span class="me">' + (i + 1) + ". Un serpent (" + leaderboard[i].score + ")</span>";
      } else {
        if(leaderboard[i].name.length !== 0)
          status += (i + 1) + '. ' + leaderboard[i].name + " (" + leaderboard[i].score + ")";
        else
          status += (i + 1) + '. Un serpent (' + leaderboard[i].score + ')';
      }
    }
    //status += '<br />Players: ' + data.players;
    document.getElementById('status').innerHTML = status;
  });

  socket.on('RIP', function () {
    gameStart = false;
    died = true;
    window.setTimeout(function() {
      document.getElementById('gameAreaWrapper').style.opacity = 0;
      document.getElementById('startMenuWrapper').style.display = "block";
      died = false;
      if (animLoopHandle) {
        window.cancelAnimationFrame(animLoopHandle);
        animLoopHandle = undefined;
      }

      // startGame();
    }, 1000);
  });

  socket.on('playerDied', function (data) {
    chat.addSystemLine('{GAME} - <b>' + (data.name.length < 1 ? 'Un serpent' : data.name) + '</b> est mort.');
  });

  socket.on('playerDisconnect', function (data) {
    chat.addSystemLine('{GAME} - A bientôt <b>' + (data.name.length < 1 ? 'Un serpent' : data.name) + '</b> !');
  });

  socket.on('playerJoin', function (data) {
    chat.addSystemLine('{GAME} - Bienvenue <b>' + (data.name.length < 1 ? 'Un serpent' : data.name) + '</b> !');
  });

  socket.on('serverMSG', function (data) {
    chat.addSystemLine(data);
  });

  // Chat.
  socket.on('serverSendPlayerChat', function (data) {
    chat.addChatLine(data.sender, data.message, false);
  });
}

window.addEventListener('resize', resize);

function resize() {
    player.screenWidth = c.width = screenWidth = window.innerWidth;
    player.screenHeight = c.height = screenHeight = window.innerHeight;

    if (socket != undefined)
      socket.emit('windowResized', { screenWidth: screenWidth, screenHeight: screenHeight });
}
