/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
var wf = WF();
wf.AppServer.net = Net;

var Net = function(srv)
{
    function netHandler(sock)
    {
        sock.srv = srv;
        // DEFAUL HOST IS LOCAL BECAUSE OF PROTOCOL
        sock.app = wf.SERVERS[srv].HOSTS['local'].appArray;
        // FORGE HOST
        sock.HOST = wf.SERVERS[srv].HOSTS['local'];
        // DO
        wf.LoopExec(sock, sock);
    }

    wf.SERVERS[srv].CLIENTS = {};
    wf.SERVERS[srv].HANDLES = {};
	// LISTEN ON EACH PORTS
    for(var p in wf.SERVERS[srv].port)
    {
        var name = srv + "_" + p + "_" + wf.SERVERS[srv].port[p];
        wf.Log(name);
        var tSrv = net.createServer(netHandler);
        wf.SERVERS[srv].HANDLES[name] = tSrv;
        tSrv.listen(wf.SERVERS[srv].port[p]);
    }
}