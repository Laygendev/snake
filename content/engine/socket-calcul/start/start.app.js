/*
Copyright (C) 2016  Adrien THIERRY
http://seraum.com
*/

module.exports.calcul = new calcul();

function calcul()
{
	var PACKET = 0;
	this.code = function(socket)
	{
		var onevent = socket.onevent;
		socket.onevent = function (packet) {
		    var args = packet.data || [];
		    onevent.call (this, packet);    // original call
		    packet.data = ["*"].concat(args);
		    onevent.call(this, packet);      // additional call to catch-all
		};

		socket.on('*', function(event,data) {
				if(!data) data = "";
				PACKET += objectSize(socket.handshake, data);
		} );
	}
	setInterval(function()
	{
		// console.log(PACKET + " o/s" );
		PACKET = 0;
	}, 1000);
}

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
