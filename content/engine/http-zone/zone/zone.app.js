/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.RouteZone = new Zone();
function Zone()
{
	this.code = function(req, res)
	{
		if(req.url == "/")
		{
			req.zone = req.HOST.default_zone;
			req.zoneUri = "";
		}
		else if(req.HOST.ZONES[req.uriParts[1]] !== undefined)
		{ 
			req.zone = req.uriParts[1];
			req.zoneUri = req.zone;
		}
		else
		{
		  req.zone = req.HOST.default_zone;
		  req.zoneUri = "";
		}
	}
}