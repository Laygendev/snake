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
	this.clients = [];

	this.code = function(socket)
	{
		self.socket = socket;
		self.clients = [];
		// Generate one CLIENTS
	 	self.clients.push({
			x: Math.floor(Math.random() * (400 - 20 - 20)) + 20,
			y: Math.floor(Math.random() * (400 - 20 - 20)) + 20,
			s: 1,
			a: Math.floor(Math.random() * 360)
		});

		// self.socket.SERVER.CLIENTS[socket.id].player = {
		// 	i:socket.id,
		// 	s: wf.CONF['SNAKE_CONF'].speed,
		// 	a: 0,
		// 	sa: wf.CONF['SNAKE_CONF'].speedAngle,
		// 	d: 0,
		// 	ls:[],
		// 	lp: [],
		// 	n: 0,
		// 	w: 0,
		// 	h: 0
		// };
		// self.socket.SERVER.CLIENTS[socket.id].player.x = Math.floor(Math.random() * (wf.CONF['SNAKE_CONF'].gameWidth - 20 - 20)) + 20;
		// self.socket.SERVER.CLIENTS[socket.id].player.y = Math.floor(Math.random() * (wf.CONF['SNAKE_CONF'].gameHeight - 20 - 20)) + 20;
		//
		// socket.on('error', self.error);
		// socket.on('0', self.respawn.bind(this, socket));
		// socket.on('2', function(player) { self.gotit(socket, player); });
		// socket.on('5', function(d) { self.updatePlayer(socket, d); });
		// socket.on('r', function(d) { self.resize(socket, d); });
	}

	this.error = function(obj) {
		console.log(obj);
	}

	this.respawn = function(socket) {
		console.log('[INFO] User respawned!');
		socket.emit('1', JSON.stringify(socket.SERVER.CLIENTS[socket.id].player));
	}

	this.gotit = function(socket, player) {
		console.log('[INFO] Player ' + player.name + ' connecting!');
		socket.SERVER.CLIENTS[socket.id].player = player;

		if (socket.SERVER.engineArray[1].exec.LoadAppByName('snake') != undefined)
			socket.SERVER.engineArray[1].exec.LoadAppByName('snake').exec.generatePath(socket.SERVER.CLIENTS[socket.id].player);

		socket.IO[0].emit('3', { n: socket.SERVER.CLIENTS[socket.id].player.name });

		var gameSetup = { w: wf.CONF['SNAKE_CONF'].gameWidth, h: wf.CONF['SNAKE_CONF'].gameHeight, s: wf.CONF['SNAKE_CONF'].speed, sa: wf.CONF['SNAKE_CONF'].speedAngle };
		socket.emit('4', JSON.stringify(gameSetup));
	}

	this.updatePlayer = function(socket, d) {
		socket.SERVER.CLIENTS[socket.id].player.d = d.d;
		socket.SERVER.CLIENTS[socket.id].player.x = d.x;
		socket.SERVER.CLIENTS[socket.id].player.y = d.y;

		socket.broadcast.emit('6', JSON.stringify(socket.SERVER.CLIENTS[socket.id].player));
	}

	this.resize = function(socket, d) {
    self.socket.SERVER.CLIENTS[socket.id].player.w = d.w;
    self.socket.SERVER.CLIENTS[socket.id].player.h = d.h;
	}

	this.sendUpdates = function() {
		if(self.socket != undefined) {
			var listUser = [];
			for(var key in self.clients) {
				// listUser.push(self.clients[key]);
				var object = { "x": parseFloat(self.clients[key].x).toFixed(2), "y": parseFloat(self.clients[key].y).toFixed(2) };
				listUser.push( object );
			}
			self.socket.IO[0].emit('6', JSON.stringify(listUser));
		}
	}

	this.moveLoop = function() {
		if(self.socket != undefined) {
			var listUser = [];
			for(var key in self.clients) {
				self.clients[key].x += self.clients[key].s * Math.cos(self.clients[key].a * Math.PI / 180);
			  self.clients[key].y += self.clients[key].s * Math.sin(self.clients[key].a * Math.PI / 180);

				if(self.clients[key].x > 410)
					self.clients[key].x = 10;
				if(self.clients[key].x < 10)
					self.clients[key].x = 410;

				if(self.clients[key].y > 410)
					self.clients[key].y = 10;
				if(self.clients[key].y < 10)
					self.clients[key].y = 410;
			}
		}
	}

	this.changeAngle = function() {
		if(self.socket != undefined) {
			var listUser = [];
			for(var key in self.clients) {
				self.clients[key].a = Math.floor(Math.random() * 360);
			}
		}
	}
}

setInterval(module.exports.serverSnake.changeAngle, 1000 / 1);
setInterval(module.exports.serverSnake.moveLoop, 1000 / wf.CONF['SNAKE_CONF'].networkUpdateFactor);
setInterval(module.exports.serverSnake.sendUpdates, 1000 / wf.CONF['SNAKE_CONF'].networkUpdateFactor);
