/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
/*

	SOCKET.IO Testing server
	Just put type="socketio" in a srv.conf.js file 
	You can swith engine from http or socketio by defining type in app.conf.js
	or engine.conf.js :
	type: ['socketio']
	type: ['http', 'socketio']

*/
var wf = WF();
wf.AppServer.socketio = SocketIO;

// get all instance of socket.io for each ports
var IO = [];
function SocketIO(srv)
{
	// HTTP SERVER HANDLER
    function httpHandler(req, res)
    {
        //SECURITY : IF NO HOST WE DROP THE REQUEST
        if(!req.headers.host)
        {
          return;
        }
        var ioh = req.headers.host.indexOf(":");
        if(ioh > -1)
        {
            req.host = req.headers.host.substring(0, ioh);
        }
        else req.host = req.headers.host;

		
		// IF DOMAIN.ABC
        if(wf.SERVERS[srv].HOSTMAP[req.host])
        {
            req.srv = srv;
            req.srvId = srv;
            req.hostId = wf.SERVERS[srv].HOSTMAP[req.host];
            req.SERVER = wf.SERVERS[srv];
            req.HOST = req.SERVER.HOSTS[wf.SERVERS[srv].HOSTMAP[req.host]];
			
			var appL = req.HOST.appArray.length;
			req.app = [];
			for(var i = 0; i < appL; i++)
			{
				if(!req.HOST.appArray[i].conf.config.type || req.HOST.appArray[i].conf.config.type.indexOf('http') > -1)
				{
					req.app.push(req.HOST.appArray[i]);
				}
			}			
            wf.LoopExec(req, res);
        }
		// IF *
        else if(wf.SERVERS[srv].HOSTMAP['*'])
        {
            req.srv = srv;
            req.srvId = srv;
            req.hostId = wf.SERVERS[srv].HOSTS[wf.SERVERS[srv].HOSTMAP['*']];
            req.SERVER = wf.SERVERS[srv];
            req.HOST = req.SERVER.HOSTS[wf.SERVERS[srv].HOSTMAP['*']];
            
			var appL = req.HOST.appArray.length;
			req.app = [];
			for(var i = 0; i < appL; i++)
			{
				if(!req.HOST.appArray[i].conf.config.type || req.HOST.appArray[i].conf.config.type.indexOf('http') > -1)
				{
					req.app.push(req.HOST.appArray[i]);
				}
			}
            // START ENGINE/APP LOOP
            wf.LoopExec(req, res);
        }
        else
        {
			// BLANK PAGE IF NOTHING WITH THIS HOST NAME EXISTS HERE
			// TODO : CREATE A HOOK FOR EMPTY ENGINE
            res.end();
        }
    }
	
	// SOCKET.IO SERVER HANDLER
	function socketioHandler(socket)
	{
		// connect each servers on each ports
		socket.IO = IO;
        //SECURITY : IF NO HOST WE DROP THE REQUEST
        if(!socket.handshake.headers.host)
        {
          return;
        }
        var ioh = socket.handshake.headers.host.indexOf(":");
        if(ioh > -1)
        {
            socket.host = socket.handshake.headers.host.substring(0, ioh);
        }
        else socket.host = socket.handshake.headers.host;

	
		// IF DOMAIN.ABC
        if(wf.SERVERS[srv].HOSTMAP[socket.host])
        {
            socket.srv = srv;
            socket.srvId = srv;
            socket.hostId = wf.SERVERS[srv].HOSTMAP[socket.host];
            socket.SERVER = wf.SERVERS[srv];
            socket.HOST = socket.SERVER.HOSTS[wf.SERVERS[srv].HOSTMAP[socket.host]];
			socket.SERVER.CLIENTS[socket.id] = socket;

			socket.on('disconnect', function() 
			{
				delete socket.SERVER.CLIENTS[socket.id];
			});
			
			var appL = socket.HOST.appArray.length;
			socket.app = [];
			for(var i = 0; i < appL; i++)
			{
				if(socket.HOST.appArray[i].conf.config.type && socket.HOST.appArray[i].conf.config.type.indexOf('socketio') > -1)
				{
					socket.app.push(socket.HOST.appArray[i]);
				}
			}			
            wf.LoopExec(socket);
        }
		// IF *
        else if(wf.SERVERS[srv].HOSTMAP['*'])
        {
            socket.srv = srv;
            socket.srvId = srv;
            socket.hostId = wf.SERVERS[srv].HOSTS[wf.SERVERS[srv].HOSTMAP['*']];
            socket.SERVER = wf.SERVERS[srv];
            socket.HOST = socket.SERVER.HOSTS[wf.SERVERS[srv].HOSTMAP['*']];
            socket.SERVER.CLIENTS[socket.id] = socket;
			var id = socket.id;
			
			socket.on('disconnect', function() 
			{
				delete socket.SERVER.CLIENTS[socket.id];
			});
			
			var appL = socket.HOST.appArray.length;
			socket.app = [];
			for(var i = 0; i < appL; i++)
			{
				if(socket.HOST.appArray[i].conf.config.type && socket.HOST.appArray[i].conf.config.type.indexOf('socketio') > -1)
				{
					socket.app.push(socket.HOST.appArray[i]);
				}
			}			
            // START ENGINE/APP LOOP
            wf.LoopExec(socket);
		
		}
	}

    // LISTEN ON EACH PORTS
    wf.SERVERS[srv].HANDLES = {};
    for(var p in wf.SERVERS[srv].port)
    {
        var name = srv + "_" + p + "_" + wf.SERVERS[srv].port[p];
        wf.Log(name);
		// HTTP HANDLER
        var handle = http.createServer(httpHandler);
		try
		{
			var io = require('socket.io')(handle);
			IO.push(io);
			tSrv = handle.listen(wf.SERVERS[srv].port[p]);
			// SOCKET.IO HANDLER
			io.on('connection', socketioHandler);
			wf.SERVERS[srv].HANDLES[name] = tSrv;
		}
		catch(e)
		{
			// ERROR NO SOCKET.IO PLUGIN
			console.log("Please, verify that socket.io is installed : npm install socket.io");
		}
    }
}
