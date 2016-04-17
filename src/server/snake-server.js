var util = require('./util');
var c = require('../../config.json');
var minify = require('jsonminify');

var users = [];
var foods = [];
var sockets = [];
var foodToAdd = c.numberFood;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var leaderboard = [];
var leaderboardChanged = false;

exports = module.exports = function(server){
  var io = require('socket.io').listen(server);

  io.on('connection', function (socket) {
    var position = {
      x: Math.floor(Math.random() * (c.gameWidth - c.radius - c.radius)) + c.radius,
      y: Math.floor(Math.random() * (c.gameHeight - c.radius - c.radius)) + c.radius
    };

    var currentPlayer = {
      id: socket.id,
      x: position.x,
      y: position.y,
      angle: Math.floor(Math.random() * 360),
      angle: 0,
      directionLock: 0,
      lastHeartbeat: new Date().getTime(),
    };

    /** Si le client redimensionne son navigateur */
    socket.on('windowResized', function (data) {
      currentPlayer.screenWidth = data.screenWidth;
      currentPlayer.screenHeight = data.screenHeight;
    });

    /** Quand un client apparait sur la map */
    socket.on('respawn', function () {
      if (util.findIndex(users, currentPlayer.id) > -1) {
        console.log('[INFO] User deleted');
        users.splice(util.findIndex(users, currentPlayer.id), 1);
      }

      socket.emit('welcome', currentPlayer);
      console.log('[INFO] User respawned!');
    });

    /** On récupère les informations du client, et on l'initialise au jeu */
    socket.on('gotit', function (player) {
      console.log( 'New player' );
      console.log('[INFO] Player ' + player.name + ' connecting!');

      if (util.findIndex(users, player.id) > -1) {
        console.log('[INFO] Player ID is already connected, kicking.');
        socket.disconnect();
      } else {
        console.log('[INFO] Player connected!');
        sockets[player.id] = socket;

        var position = {
          x: Math.floor(Math.random() * (c.gameWidth - c.radius - c.radius)) + c.radius,
          y: Math.floor(Math.random() * (c.gameHeight - c.radius - c.radius)) + c.radius
        };

        player.speed = c.speed;
        player.listSegment = [];
        player.listPath = [];
        player.number = 0;

        generatePath(player);

        currentPlayer = player;
        currentPlayer.lastHeartbeat = new Date().getTime();
        users.push(currentPlayer);

        io.emit('playerJoin', { name: currentPlayer.name });

        socket.emit('gameSetup', {
            gameWidth: c.gameWidth,
            gameHeight: c.gameHeight,
            x: position.x,
            y: position.y,
            number: c.number,
            speed: player.speed,
            angle: player.angle,
        });
        console.log('Total players: ' + users.length);
      }
    });

    /** Quand un client se déconnecte */
    socket.on('disconnect', function () {
      if (util.findIndex(users, currentPlayer.id) > -1)
        users.splice(util.findIndex(users, currentPlayer.id), 1);
      console.log('[INFO] User ' + currentPlayer.name + ' disconnected!');

      socket.broadcast.emit('playerDisconnect', { name: currentPlayer.name } );
    });

    socket.on('playerChat', function(data) {
      var _sender = data.sender.replace(/(<([^>]+)>)/ig, '');
      var _message = data.message.replace(/(<([^>]+)>)/ig, '');
      if (c.logChat === 1) {
          console.log('[CHAT] [' + (new Date()).getHours() + ':' + (new Date()).getMinutes() + '] ' + _sender + ': ' + _message);
      }
      socket.broadcast.emit('serverSendPlayerChat', {sender: _sender, message: _message.substring(0,35)});
    });

    // Heartbeat function, update everytime.
    socket.on('0', function (directionLock) {
      currentPlayer.lastHeartbeat = new Date().getTime();
      if (directionLock !== currentPlayer.directionLock) {
          currentPlayer.directionLock = directionLock;
      }
    });
  });

  /** Ajoute des pommes */
  function addFood(toAdd) {
    var radius = 10;
    while (toAdd--) {
      var position = {
        x: Math.floor(Math.random() * (c.gameWidth - 10 - 10)) + 10,
        y: Math.floor(Math.random() * (c.gameHeight - 10 - 10)) + 10
      };

      foods.push({
        // Make IDs unique.
        id: ((new Date()).getTime() + '' + foods.length) >>> 0,
        x: position.x,
        y: position.y,
        radius: 10
      });

      foodToAdd--;
    }
  }

  /** A chaque frame, on met à jour le joueur */
  function tickPlayer(currentPlayer) {
    if(currentPlayer.lastHeartbeat < new Date().getTime() - c.maxHeartbeatInterval) {
      sockets[currentPlayer.id].emit('kick', 'Last heartbeat received over ' + c.maxHeartbeatInterval + ' ago.');
      sockets[currentPlayer.id].emit('RIP');
      sockets[currentPlayer.id].disconnect();
    }
    if (currentPlayer != undefined) {
      movePlayer(currentPlayer);
      checkCollider(currentPlayer);
      eatFood(currentPlayer);
    }
  }

  /** Quand le client mange une pomme, on lui ajoute un segment */
  function generatePath(currentPlayer) {
    var lastX = currentPlayer.listSegment.length == 0 ? currentPlayer.x : currentPlayer.listPath[currentPlayer.listSegment[currentPlayer.listSegment.length - 1]].x;
    var lastY = currentPlayer.listSegment.length == 0 ? currentPlayer.y : currentPlayer.listPath[currentPlayer.listSegment[currentPlayer.listSegment.length - 1]].y;

    for(var i = currentPlayer.listSegment.length * (20 / c.speed); i < (currentPlayer.number * (20 / c.speed)) + 1; i++) {
      if( i % (20 / c.speed) == 0 && i != currentPlayer.listSegment.length * (20 / c.speed) )
        currentPlayer.listSegment.push(i);

      currentPlayer.listPath[i] = { x: lastX, y: lastY };
    }
  }

  /** Déplace le joueur selon son angle */
  function movePlayer(currentPlayer) {
    if (currentPlayer.directionLock == KEY_LEFT) {
      currentPlayer.angle -= c.speedAngle;
    }
    if (currentPlayer.directionLock == KEY_RIGHT) {
      currentPlayer.angle += c.speedAngle;
    }

    var borderCalc = c.radius / 3;

    currentPlayer.x += c.speed * Math.cos(currentPlayer.angle * Math.PI / 180);
    currentPlayer.y += c.speed * Math.sin(currentPlayer.angle * Math.PI / 180);

    if (currentPlayer.x > c.gameWidth - borderCalc) {
        currentPlayer.x =  borderCalc;
    }
    if (currentPlayer.y > c.gameHeight - borderCalc) {
        currentPlayer.y = borderCalc;
    }
    if (currentPlayer.x < borderCalc) {
        currentPlayer.x = c.gameWidth - borderCalc;
    }
    if (currentPlayer.y < borderCalc) {
        currentPlayer.y = c.gameHeight - borderCalc;
    }

    var part = currentPlayer.listPath.pop();
    part.x = currentPlayer.x;
    part.y = currentPlayer.y,
    currentPlayer.listPath.unshift(part);
  }

  /** Vérifie si le joueur entre en collision */
  function checkCollider(currentPlayer) {
    for (var key in users) {
      // Tête à tête
      if( users[key].id != currentPlayer.id &&
        users[key].x < currentPlayer.x + 5 &&
        users[key].x + 5 > currentPlayer.x - 5 &&
        users[key].y < currentPlayer.y + 5 &&
        users[key].y + 5 > currentPlayer.y - 5 ) {
          var userDiedIds = [ currentPlayer.id, users[key].id ];

          currentPlayer.listPath = [];
          currentPlayer.listSegment = [];
          users[key].listPath = [];
          users[key].listSegment = [];
          io.emit('playerDied', { name: currentPlayer.name });
          io.emit('playerDied', { name: users[key].name });

          for (var i in userDiedIds) {
            users.splice(util.findIndex(users, userDiedIds[i]), 1);
            sockets[userDiedIds[i]].emit('RIP');

          }
          break;
      }

      // Les segments
      for (var x in users[key].listSegment) {
        if ( x != 0 && users[key].listPath[users[key].listSegment[x]].x < currentPlayer.x + 5 &&
        users[key].listPath[users[key].listSegment[x]].x + 5 > currentPlayer.x - 5 &&
        users[key].listPath[users[key].listSegment[x]].y < currentPlayer.y + 5 &&
        users[key].listPath[users[key].listSegment[x]].y + 5 > currentPlayer.y - 5 ) {
          currentPlayer.listPath = [];
          currentPlayer.listSegment = [];
          users.splice(util.findIndex(users, currentPlayer.id), 1);
          sockets[currentPlayer.id].emit('RIP');
          io.emit('playerDied', { name: currentPlayer.name });
          break;
        }
      }
    }
  }

  /** Vérifie si le joueur mange une pomme */
  function eatFood(currentPlayer) {
    for (var key in foods) {
      if ( foods[key].x < currentPlayer.x + 8 &&
      foods[key].x + 5 > currentPlayer.x - 8 &&
      foods[key].y < currentPlayer.y + 8 &&
      foods[key].y + 5 > currentPlayer.y - 8 ) {
        foods.splice( key, 1 );
        foodToAdd++;
        currentPlayer.number++;
        generatePath(currentPlayer);

      }
    }
  }

  function moveLoop() {
    for (var i in users) {
      tickPlayer(users[i]);
    }
  }

  function gameLoop() {
    if (foodToAdd > 0) {
      addFood(foodToAdd);
    }

    if (users.length > 0) {
      var cUsers = util.clone( users );
      cUsers.sort( function(a, b) { return b.number - a.number; });

      var topUsers = [];

      for (var i = 0; i < Math.min(5, cUsers.length); i++) {
        if(cUsers[i]) {
          topUsers.push({
            id: cUsers[i].id,
            name: cUsers[i].name,
            score: cUsers[i].number
          });
        }
      }
      if (isNaN(leaderboard) || leaderboard.length !== topUsers.length) {
        leaderboard = topUsers;
        leaderboardChanged = true;
      }
      else {
        for (i = 0; i < leaderboard.length; i++) {
          if (leaderboard[i].id !== topUsers[i].id) {
            leaderboard = topUsers;
            leaderboardChanged = true;
            break;
          }
        }
      }
    }
  }

  function sendUpdates() {
    users.forEach( function(u, k) {
      var listUser = users.map( function(f) {
        return {
          center: f.id === u.id ? true : false,
          x: f.x,
          y: f.y,
          listSegment: f.listSegment.map( function(s) {
            if ( f.listPath[s].x > u.x - u.screenWidth/2 - 20 &&
                f.listPath[s].x < u.x + u.screenWidth/2 + 20 &&
                f.listPath[s].y > u.y - u.screenHeight/2 - 20 &&
                f.listPath[s].y < u.y + u.screenHeight/2 + 20) {
                return {
                  x: f.listPath[s].x,
                  y: f.listPath[s].y,
                }
            }
          }).filter(function(s) { return s; } ),
        };
      });


      var visibleFoods = foods.map( function(f) {
        if ( f.x > u.x - u.screenWidth/2 - 20 &&
            f.x < u.x + u.screenWidth/2 + 20 &&
            f.y > u.y - u.screenHeight/2 - 20 &&
            f.y < u.y + u.screenHeight/2 + 20) {
            return f;
          }
        })
        .filter(function(f) { return f; });

      listUser = JSON.stringify(listUser);
      listUser = minify(listUser);

      sockets[u.id].emit('serverTellPlayerMove', listUser, visibleFoods);
      if (leaderboardChanged) {
        sockets[u.id].emit('leaderboard', {
          players: users.length,
          leaderboard: leaderboard
        });
      }
    });

    leaderboardChanged = false;
  }

  setInterval(moveLoop, 1000 / c.networkUpdateFactor);
  setInterval(gameLoop, 1000 / c.networkUpdateFactor);
  setInterval(sendUpdates, 1000 / c.networkUpdateFactor);
}
