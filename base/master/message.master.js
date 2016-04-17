/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Message = new MasterMessage();


function MasterMessage()
{

  this.sendAll = function(msg)
  {
     Object.keys(cluster.workers).forEach(function(id)
    {
      if(!msg.restrict || (msg.restrict && cluster.workers[id].srvId && cluster.workers[id].srvId == msg.srvId ))
      {
        if(msg.from === undefined || msg.from != id)
        {
            cluster.workers[id].send(msg);
        }
      }
     });
  }

  this.reloadAllSrv = function()
  {
    this.sendAll({cmd:'reloadAllSrv'});
  }

}
