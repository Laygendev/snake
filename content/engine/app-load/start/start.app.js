/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com

*/
module.exports.cAppStart = new cAppStart();

var wf = WF();

function cAppStart()
{
	this.code = function(socket)
	{
	}

	this.LoadAppByName = function(name) {
		for (var key in wf.SERVERS['socketio'].APPS['socketio-example']) {
			if (wf.SERVERS['socketio'].APPS['socketio-example'][key].name == name)
				return wf.SERVERS['socketio'].APPS['socketio-example'][key];
		}

		return undefined;
	}
}
