/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Service = new MasterService();
var wf = WF();

function MasterService()
{
	this.Start = function()
	{
		if(wf.Service.checkArgs())
		{
			wf.Service.loadAll();
			wf.Service.startSrv();
		}
	}

	this.checkArgs = function()
	{
        /*if(wf.args._.length < 1 && wf.args.help === undefined)
			return true;
		else
			wf.CLI.check();
		return false;*/
        return true;
	}

	this.loadAll = function()
    {
        // LOAD SLAVES SERVICES
        wf.LoadProcess();
        wf.LoadServer();
  }

    // CREER UN OBJET WORKERS AVEC EN INDICE SON ID ET SON SRVID POUR LE RELANCER
    this.startSrv = function(srvId)
    {

        if(!srvId)
        {
            for(var s in wf.SERVERS)
            {
                var nbrThread = wf.SERVERS[s].thread;
                if(nbrThread === undefined || nbrThread < 1)
                  nbrThread = 1;
                for(var i = 0; i < nbrThread; i++)
                {
                    wf.Cluster.createWorker( s, i );
                }
            }
        }
        else
        {
            try
            {
                var nbrThread = wf.SERVERS[srvId].thread;
                if(nbrThread === undefined || nbrThread < 1)
                  nbrThread = 1;
                for(var i = 0; i < nbrThread; i++)
                {
                    wf.Cluster.createWorker( srvId, i );
                }
            }
            catch(e){}
        }
    }

    // RELOAD ALL SRV
    this.reloadAllSrv = function(msg)
    {
        wf.Log("[!] Reloading all servers");
        wf.Service.loadAll();
        this.relayWorker({action: 'reloadAllSrv'});
    }

    this.reloadSrv = function(msg)
    {
        wf.Log("[!] Reloading server : " + msg.srvId);
        wf.Service.loadAll();
        if(!wf.SERVERS[msg.srvId])
        {
            //wf.SERVERS[msg.srvId].state = true;
            //wf.Service.startSrv(msg.srvId);
        }
        else if(wf.SERVERS[msg.srvId].state == false)
        {
            wf.SERVERS[msg.srvId].state = true;
            var cb = function() { wf.Service.startSrv(msg.srvId); };
            wf.Dump({ type: "server", srvId: msg.srvId }, cb);
        }
        else
        {
            this.relayWorker({action: 'reloadAllSrv', srvId: msg.srvId, restrict: true});
        }
    }
    
    this.stopSrv = function(msg)
    {
        wf.Log("[!] Stopping : " + msg.srvId);
        for(var c in wf.CLUSTERS)
        {
            if(wf.CLUSTERS[c].srvId == msg.srvId)
            {
                
                wf.Cluster.deleteCluster(c);
            }
        }
        this.relayWorker({action: 'stopSrv', srvId: msg.srvId, restrict: true});
        wf.Service.loadAll();
        if(wf.SERVERS[msg.srvId])
        {
            wf.SERVERS[msg.srvId].state = false;
        }
    }

    // STOP MASTER FOR RESTART
    this.restartWF = function(msg)
    {
        process.exit();
    }
    
    this.dump = function(msg)
    {
        wf.Dump(msg);
    }
    
    // RELAY MSG TO WROKERS
    this.relayWorker = function(msg)
    {
        msg.cmd = msg.action;
        wf.Message.sendAll(msg);
    }

    this.haltSystem = function(msg)
    {
        exec(wf.CONF.SYSTEM["HALT_CMD"]);
    }

    this.rebootSystem = function(msg)
    {
        exec(wf.CONF.SYSTEM["REBOOT_CMD"]);
    }

    this.deploy = function(msg)
    {
        if(wf.Deploy[msg.action])
        {
            wf.Deploy[msg.action](msg.param);
        }
    }
    
    this.execChrootedDaemon = function(msg)
    {
        if(msg.action)
        {
            exec(msg.action, {timeout: 0}, function(err, stdout, stderr)
            {
                console.log(err);
                console.log(stdout);
                console.log(stderr);
                return;
            });
        }
    }
}
