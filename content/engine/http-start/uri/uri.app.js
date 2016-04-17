/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.uriEngine = new uriEngine();

function uriEngine()
{    
    var replacePoints = /(\.\.)+/;
    this.code = function(req, res)
    { 
        req.url = req.url.replace(replacePoints, '');
        if(req.url.indexOf('/') != 0) req.url = "/" + req.url;
        req.uriParts    = req.url.split("/");
        req.uriParts[0] = req.headers.host;
    }
}