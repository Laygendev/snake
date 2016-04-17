/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.EventEss = new EventEss();

function EventEss()
{

  WF().event = new events.EventEmitter();

}
