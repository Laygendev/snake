/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Srv = new Srv();
module.exports.SrvOpen = Srv.Open;
module.exports.LoadServer = LoadServer;
module.exports.LoadServerEngine = LoadServerEngine;
module.exports.LoopExec = LoopExec;
module.exports.AppServer = {};

UTILS.LoopExec = LoopExec;

'use strict';
var wf = WF();

function Srv()
{
  'strict mode';

	this.Run = function()
	{
		for(var s in wf.SERVERS)
		{
            if(wf.SERVERS[s].state)
		      Open(s);
		}
		securify();
	}

  function DoRun()
  {
     for(var s in wf.SERVERS)
    {
        if(wf.SERVERS[s])
            Open(s);
    }
	  securify();
  }

// TODO : METTRE CETTE FUNCTION DANS LES ENGINE

var securify = function()
{
     if (wf.CONF['CHANGE_ID'] !== undefined && wf.CONF['CHANGE_ID'] == true && process.getuid && process.setuid)
    {
        try
        {
                if(wf.CONF['GROUP_ID'] !== undefined)
                    process.setgid(wf.CONF['GROUP_ID']);
                if(wf.CONF['USER_ID'] !== undefined)
                    process.setuid(wf.CONF['USER_ID']);
        }catch(e){

        }
    }
}
var Open = function(srv)
{
    if(wf.SERVERS[srv].state !== undefined && (wf.SERVERS[srv].state == 1 || wf.SERVERS[srv].state == true))
    {
        if(wf.AppServer[wf.SERVERS[srv].type])
        {
            wf.AppServer[wf.SERVERS[srv].type](srv);            
        }
        else
        {
            wf.Log("Unknown server type");
        }
    }
}

  this.deleteAll = function()
  {

      for(var s in wf.SERVERS)
      {
        this.deleteSrv(s);
      }
  }

  this.deleteSrv = function(id)
  {

    if(wf.SERVERS[id] !== undefined)
    {
      for(var c in wf.SERVERS[id].CLIENTS)
      {
          this.deleteClient(id, c);
      }

      for(var h in wf.SERVERS[id].HANDLES)
      {
        wf.SERVERS[id].HANDLES[h].close();
      }
      delete wf.SERVERS[id];
    }
  }

  this.deleteClient = function(srv, client)
  {
    if(wf.SERVERS[srv] !== undefined && wf.SERVERS[srv].CLIENTS !== undefined)
    {
      if(wf.SERVERS[srv].CLIENTS[client] !== undefined && wf.SERVERS[srv].CLIENTS[client].destroy !== undefined)
      {
        wf.SERVERS[srv].CLIENTS[client].destroy();
      }
      delete wf.SERVERS[srv].CLIENTS[client]
    }
  }


	function getSrvArray(p)
	{
		var sArr = [];
		var end = wf.CONF['APP_END'];
		var c = wf.CONF['APP_PATH'] + p;
		if(fs.existsSync(c) && fs.lstatSync(c).isDirectory())
		{
			var dArr = fs.readdirSync(c);
			dArr.forEach(function(d)
			{
				if (fs.lstatSync(c +'/' + d).isDirectory() && d != "." && d != "..")
				{
					var app = new App(c, d);
					if(app.appState && app.conf.config['state']) { aArr.push(app); }
				}
			});
		}
		return aArr;
	}
}

function LoopExec(req, res)
{
  req.continue = true;
    if(!req.loop) req.loop = 0;
  var appL = req.app.length;
  while(req.loop < appL)
  {
    if(req.continue)
    {
        wf.Launch(req, res);
        req.loop++
    }
    else break;
  }
}

function LoadServer(id)
{
	var full = true;
	if(id !== undefined) full = false;
    if(!wf.SERVERS)
	   wf.SERVERS = { };
	var sDir = wf.CONF['SRV_PATH'];
	if(fs.existsSync(sDir) && fs.lstatSync(sDir).isDirectory())
	{
		var hArr = fs.readdirSync(sDir);
		hArr.forEach(function(d)
		{

      var conf = d + wf.CONF['CONFIG_END'];
			if ( fs.existsSync(sDir + d + '/' + conf) && fs.lstatSync(sDir + d + '/' + conf).isFile() && d != "." && d != ".." &&
				( full || d == id) )
			{

        try
        {
          var srvConf = require (sDir + d + '/' + conf);
        
          for(var prop in srvConf)
          {
            var tmpConf = srvConf[prop];

            if(tmpConf.state == true)
            {
              wf.SERVERS[d] = tmpConf;
              wf.SERVERS[d].id = d;
			  wf.SERVERS[d].CLIENTS = [];
            }
            
          }
        }
        catch(e)
        {
          console.log("[!] Error conf : " + sDir + d + '/' + conf);
        }
      }
		});
	}
}

function LoadServerEngine()
{
    for(var s in wf.SERVERS)
    {
        wf.SERVERS[s].engineArray = [];
        for(var a in wf.SERVERS[s].engine)
        {
            if(wf.ENGINES !== undefined && wf.ENGINES[a] !== undefined)
            {
              for(var p in wf.ENGINES[a])
              {
                  if(wf.ENGINES[a][p] !== undefined)
                  {
                      var eng = wf.ENGINES[a][p];
                      if(typeof wf.SERVERS[s].engine[a] == "object")
                          eng.init = wf.SERVERS[s].engine[a];
                    wf.SERVERS[s].engineArray.push(eng);
                  }
              }
            }
        }
    }
}
