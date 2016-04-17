/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
var wf = WF();
module.exports.Cluster = new MasterCluster();


function MasterCluster()
{
	wf.CLUSTERS = {};

	this.exitFunction = function(worker, code, signal)
	{
		//wf.Log("[M] A worker died; reloading one with srvid : " + worker.srvId + " - " + worker.wrkId);
        if(wf.SERVERS[worker.srvId] && wf.SERVERS[worker.srvId].state)
        {
            wf.Cluster.createWorker( worker.srvId, worker.wrkId );
        }
		delete wf.CLUSTERS[worker.id];
	}
	
    // ON CAPTE LA FERMETURE D'UN WORKER ET ON LE RELANCE
    cluster.on('exit', this.exitFunction);

	this.createWorker = function(srvId, wrkId)
	{
		var c = cluster.fork( { srvId: srvId, wrkId: wrkId } );
		wf.CLUSTERS[c.id] = c;
		wf.CLUSTERS[c.id].srvId = srvId;
        wf.CLUSTERS[c.id].wrkId = wrkId;
		cluster.workers[c.id].on('message', function(msg)
		{
  			 if(msg.cmd !== undefined)
			{
			   wf.Event.DoCmd(msg);
			}
		});
		return c;
	}
	
	this.deleteClusters = function()
	{
		for(var c in wf.CLUSTERS)
		{
			this.deleteCluster(wf.CLUSTERS[c].id);
		}
	}
	
	this.deleteCluster = function(id)
	{
		delete wf.CLUSTERS[id];
	}
}
