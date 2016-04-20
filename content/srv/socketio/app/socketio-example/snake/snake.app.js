/*

Copyright (C) 2016  Jimmy LATOUR
http://labodudev.fr

*/
module.exports.snake = new snake();

var wf = WF();

function snake()
{
	var self = this;
	this.socket = undefined;

	this.code = function(socket) {
		self.socket = socket;
	}

	this.generatePath = function(player) {
		var lastX = player.ls.length == 0 ? player[0] : player.lp[player.ls[player.ls.length - 1]][0];
		var lastY = player.ls.length == 0 ? player[1] : player.lp[player.ls[player.ls.length - 1]][1];
		for(var i = player.ls.length * (20 / wf.CONF['SNAKE_CONF'].speed); i < (player.n * (20 / wf.CONF['SNAKE_CONF'].speed)) + 1; i++) {
			if( i % (20 / wf.CONF['SNAKE_CONF'].speed) == 0 && i != player.ls.length * (20 / wf.CONF['SNAKE_CONF'].speed) )
				player.ls.push(i);

			player.lp[i] = { 0: lastX, 1: lastY };
		}
	}

	this.moveLoop = function() {
		if(self.socket != undefined) {
			var size = Object.keys(self.socket.SERVER.CLIENTS).length;
			if(self.socket.SERVER != undefined && self.socket.SERVER.CLIENTS != undefined && size > 0) {
				for (var i in self.socket.SERVER.CLIENTS) {
					if(self.socket.SERVER.CLIENTS[i].player != undefined) {
						self.tickPlayer(self.socket.SERVER.CLIENTS[i].player);
					}
				}
			}
		}
	}

	this.tickPlayer = function(player) {
		// if(currentPlayer.lastHeartbeat < new Date().getTime() - c.maxHeartbeatInterval) {
    //   sockets[currentPlayer.id].emit('kick', 'Last heartbeat received over ' + c.maxHeartbeatInterval + ' ago.');
    //   sockets[currentPlayer.id].emit('RIP');
    //   sockets[currentPlayer.id].disconnect();
    // }
    if (player != undefined) {
      self.movePlayer(player);
      // checkCollider(currentPlayer);
      self.eatFood(player);
    }
	}

	this.movePlayer = function(player) {
		if (player.d == wf.CONF['SNAKE_CONF'].KEY_LEFT) {
      player.a -= wf.CONF['SNAKE_CONF'].speedAngle;
    }
    if (player.d == wf.CONF['SNAKE_CONF'].KEY_RIGHT) {
      player.a += wf.CONF['SNAKE_CONF'].speedAngle;
    }

    player[0] += wf.CONF['SNAKE_CONF'].speed * Math.cos(player.a * Math.PI / 180);
    player[1] += wf.CONF['SNAKE_CONF'].speed * Math.sin(player.a * Math.PI / 180);

		if (player.lp.length > 0) {
	    var part = player.lp.pop();
	    part[0] = player[0];
	    part[1] = player[1];
	    player.lp.unshift(part);
		}
	}

	this.eatFood = function(player) {
		var listFoods = self.socket.SERVER.engineArray[2].exec.LoadAppByName('food') != undefined ? self.socket.SERVER.engineArray[2].exec.LoadAppByName('food').exec.getFoods() : [];
		for (var key in listFoods) {
      if ( listFoods[key].x < player[0] + 8 &&
      listFoods[key].x + 5 > player[0] - 8 &&
      listFoods[key].y < player[1] + 8 &&
      listFoods[key].y + 5 > player[1] - 8 ) {
        listFoods.splice( key, 1 );
        // self.foodToAdd++;
        player.n++;
        self.generatePath(player);
      }
    }
	}

	this.gameLoop = function() {
		if( self.socket != undefined && self.socket.SERVER.engineArray[2].exec.LoadAppByName('food') != undefined ) {
			self.socket.SERVER.engineArray[2].exec.LoadAppByName('food').exec.gameLoop();
		}
	}
}


// setInterval(module.exports.snake.gameLoop, 1000);
