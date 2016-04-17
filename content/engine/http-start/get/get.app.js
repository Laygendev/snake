/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.HttpGet = new GetHttp();

function GetHttp()
{
	this.code = function(req, res)
	{
        req.get = {};
        req.rawUrl = req.url;
        if(req.url.indexOf("?") == -1) 
        {
            return;
        }
        else
        {
            var sep = req.url.split("?");
            req.url = unescape(sep[0]);

            if(sep[1] !== undefined)
            {
                var obj = sep[1].split("&");
                var objL = obj.length;
                for(var o = 0; o < objL; o++)
                {
                    var t = obj[o].split("=");
                    if(t[1] === undefined) t[1] = "";
                    req.get[t[0]] = unescape(t[1]);
                }

            }
        }
	}
}
