/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.HttpCookie = new HttpCookie();

function HttpCookie()
{
	this.code = function(req, res)
	{
		var u = req.headers.cookie;
		req.cookie = {};
		if(u !== undefined && u.length > 0)
		{
			var obj = u.split("; ");
			var objL = obj.length;
			for(var o = 0; o < objL; o++)
			{
				var t = obj[o].split("=");
				if(t[1] === undefined) t[1] = "";
				req.cookie[t[0]] = t[1];
			}
		}
	}
}
