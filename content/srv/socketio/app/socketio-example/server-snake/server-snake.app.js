/*

Copyright (C) 2016  Jimmy LATOUR
http://labodudev.fr

*/
module.exports.serverSnake = new serverSnake();

var wf = WF();

function serverSnake()
{
	var self = this;
	this.socket = undefined;
	this.currentPlayer = undefined;

	this.code = function(socket)
	{
		self.socket = socket;
		self.currentPlayer = { i: socket.id, l: new Date().getTime(), x: 50, y: 50, s: wf.CONF['SNAKE_CONF'].speed, a: 0, sa: wf.CONF['SNAKE_CONF'].speedAngle, d: 0, ls:[], lp: [], n: 0, w: 0, h: 0 };
		socket.on('error', this.error);
		socket.on('0', self.respawn);
		socket.on('2', self.gotit);
		socket.on('5', self.updatePlayer);
	}

	this.error = function(obj) {
		console.log(obj);
	}

	this.respawn = function() {
		console.log('[INFO] User respawned!');
		self.currentPlayer = JSON.stringify(self.currentPlayer);
		self.socket.emit('1', self.currentPlayer);
	}

	this.gotit = function(player) {
		console.log('[INFO] Player ' + player.name + ' connecting!');
		self.currentPlayer = player;
		self.currentPlayer.l = new Date().getTime(); // lastHeartBeat

		self.socket.SERVER.APPS['socketio-example'][2].exec.generatePath(self.currentPlayer);

		self.socket.SERVER.CLIENTS[self.currentPlayer.i].player = self.currentPlayer;
		self.socket.IO[0].emit('3', { n: self.currentPlayer.name });
		console.log( self.currentPlayer );

		var gameSetup = { w: wf.CONF['SNAKE_CONF'].gameWidth, h: wf.CONF['SNAKE_CONF'].gameHeight, s: wf.CONF['SNAKE_CONF'].speed, sa: wf.CONF['SNAKE_CONF'].speedAngle };
		gameSetup = JSON.stringify(gameSetup);
		self.socket.emit('4', gameSetup);
	}

	this.updatePlayer = function(d) {
		self.currentPlayer.l = new Date().getTime();
		if (d !== self.currentPlayer.d) {
			self.currentPlayer.d = d;
		}
	}

	this.sendUpdates = function() {
		if(self.socket != undefined) {
			var size = Object.keys(self.socket.SERVER.CLIENTS).length;
			if(self.socket.SERVER != undefined && self.socket.SERVER.CLIENTS != undefined && size > 0) {

				for (var i in self.socket.SERVER.CLIENTS) {
					var listUser = {};
					for (var y in self.socket.SERVER.CLIENTS) {
						if (self.socket.SERVER.CLIENTS[y].player != undefined /*&& i !== y*/) {
							listUser[y] = {
								c: i === y ? true : false,
								x: self.socket.SERVER.CLIENTS[y].player.x,
								y: self.socket.SERVER.CLIENTS[y].player.y,
								ls: [],
							};
						}
					}

					// foods
					var listFoods = self.socket.SERVER.APPS['socketio-example'][0].exec.getFoods();
					var visibleFoods = [];
					if( self.socket.SERVER.CLIENTS[i].player != undefined ) {
						for (var y in listFoods) {
							if ( listFoods[y].x > self.socket.SERVER.CLIENTS[i].player.x - self.socket.SERVER.CLIENTS[i].player.w/2 - 20 &&
		            listFoods[y].x < self.socket.SERVER.CLIENTS[i].player.x + self.socket.SERVER.CLIENTS[i].player.w/2 + 20 &&
		            listFoods[y].y > self.socket.SERVER.CLIENTS[i].player.y - self.socket.SERVER.CLIENTS[i].player.h/2 - 20 &&
		            listFoods[y].y < self.socket.SERVER.CLIENTS[i].player.y + self.socket.SERVER.CLIENTS[i].player.h/2 + 20) {
									visibleFoods.push(listFoods[y]);
							}
						}
					}

					listUser = JSON.stringify(listUser);
					visibleFoods = JSON.stringify(visibleFoods);

					self.socket.SERVER.CLIENTS[i].emit('6', listUser, visibleFoods);
				}
			}
		}
	}
}

setInterval(module.exports.serverSnake.sendUpdates, 1000 / wf.CONF['SNAKE_CONF'].networkUpdateFactor);
