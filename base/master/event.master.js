/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Event = new MasterEvent();
var wf = WF();

function MasterEvent()
{

  this.DoCmd = function(msg)
  {
    if(wf.Service[msg.cmd] !== undefined)
    {
      wf.Service[msg.cmd](msg);
    }
  }
  
}
