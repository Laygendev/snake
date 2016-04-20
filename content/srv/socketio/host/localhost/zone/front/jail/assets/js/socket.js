var socket;
var users = [];
var foods = [];
var player = {};

// var onevent = socket.onevent;
// socket.onevent = function (packet) {
//     var args = packet.data || [];
//     onevent.call (this, packet);    // original call
//     packet.data = ["*"].concat(args);
//     onevent.call(this, packet);      // additional call to catch-all
// };
//
// socket.on('*', function(event,data) {
//     if(!data) data = "";
//     PACKET += objectSize(socket.handshake, data);
// } );
// }


var PACKETR = 0;
var PACKETE = 0;


function objectSize( object , msg )
{
		/*
			Ici ta fonction qui calcule la taille du packet envoyé
			en faisant une fonction récursive et en calculant le
			nombre de byte, cf function en dessous
		*/
		var result = roughSizeOfObject(object);
		if(msg)
			result += roughSizeOfObject(msg);
		return result;
}

function roughSizeOfObject( value, level ) {
    if(level == undefined) level = 0;
    var bytes = 0;

    if ( typeof value === 'boolean' ) {
        bytes = 4;
    }
    else if ( typeof value === 'string' ) {
        bytes = value.length * 2;
    }
    else if ( typeof value === 'number' ) {
        bytes = 8;
    }
    else if ( typeof value === 'object' ) {
        if(value['__visited__']) return 0;
        value['__visited__'] = 1;
        for( i in value ) {
            bytes += i.length * 2;
            bytes+= 8; // an assumed existence overhead
            bytes+= roughSizeOfObject( value[i], 1 )
        }
    }

    if(level == 0){
        clear__visited__(value);
    }
    return bytes;
}

function clear__visited__(value){
    if(typeof value == 'object'){
        delete value['__visited__'];
        for(var i in value){
            clear__visited__(value[i]);
        }
    }
}


function setupSocket() {
  var onevent = socket.onevent;
  socket.onevent = function(packet) {
    var args = packet.data || [];
    onevent.call (this, packet);    // original call
    packet.data = ["*"].concat(args);
    onevent.call(this, packet);
  };

  socket.on('*', function(event, data) {
    if(!data) data = "";
    PACKETR += objectSize(socket.handshake, data);
  });

  socket.on('1', function (playerSettings) {
    var playerSettings = JSON.parse(playerSettings);
    player = playerSettings;
    player.name = playerName;
    player.w = screenWidth;
    player.h = screenHeight;
    // chat.addSystemLine('Bienvenue petit serpent!');
    PACKETE += objectSize(player);
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

  socket.on('6', function (userData, listFoods) {
		if(listFoods != undefined) {
			foods = JSON.parse(listFoods);
		}
		if(userData != undefined) {
	    userData = JSON.parse(userData);

			users = [];
	    for (var key in userData) {
	      users[key] = userData[key];

				if( key == player[3] ) {
					player[0] = userData[key][0];
					player[1] = userData[key][1];
				}
	    }
		}
  });
}

window.addEventListener('resize', resize);

function resize() {
    player.w = screenWidth = window.innerWidth;
    player.h = screenHeight = window.innerHeight;

    if (socket != undefined)
      socket.emit('r', { w: screenWidth, h: screenHeight });
}
