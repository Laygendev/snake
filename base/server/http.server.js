/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
var wf = WF();
wf.AppServer.http = HttpServer;

function HttpServer(srv)
{

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
            req.HOST = wf.SERVERS[srv].HOSTS[wf.SERVERS[srv].HOSTMAP[req.host]];
            req.app = req.HOST.appArray;
            wf.LoopExec(req, res);
        }
		// IF *
        else if(wf.SERVERS[srv].HOSTMAP['*'])
        {
            req.srv = srv;
            req.srvId = srv;
            req.hostId = wf.SERVERS[srv].HOSTS[wf.SERVERS[srv].HOSTMAP['*']];
            req.HOST = wf.SERVERS[srv].HOSTS[wf.SERVERS[srv].HOSTMAP['*']];
            req.app = wf.SERVERS[srv].HOSTS[wf.SERVERS[srv].HOSTMAP['*']].appArray;
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

    // LISTEN ON EACH PORTS
    wf.SERVERS[srv].HANDLES = {};
    for(var p in wf.SERVERS[srv].port)
    {
        var name = srv + "_" + p + "_" + wf.SERVERS[srv].port[p];
        wf.Log(name);
        var tSrv = http.createServer(httpHandler).listen(wf.SERVERS[srv].port[p]);
        wf.SERVERS[srv].HANDLES[name] = tSrv;
    }
}