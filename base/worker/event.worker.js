/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Event = new WorkerEvent();

var wf = WF();

function WorkerEvent()
{
  	process.on('message', function(msg)
    {
      if(msg.cmd !== undefined)
      {
         wf.Event.DoCmd(msg);
      }
    }),

    this.DoCmd = function(msg)
    {
      if(wf.Service[msg.cmd] !== undefined)
      {
        wf.Service[msg.cmd](msg);
      }
    }
}
