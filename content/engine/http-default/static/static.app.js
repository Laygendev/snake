/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.RouteStatic = new RouteStatic();
function RouteStatic()
{
    var wf = WF();
    this.code = function(req, res)
    {
        var sUrl = "";
        if(req.zone == req.HOST.default_zone)
        {
            if(req.url.indexOf("/" + req.HOST.default_zone) < 0)
            {
                sUrl = "/" + req.zone + req.url;
            }
        }
        else
        {
            sUrl = req.url;
        }

        if(req.HOST.ZONES[req.zone] && req.HOST.ZONES[req.zone].shared !== undefined 
            && req.HOST.ZONES[req.zone].shared[sUrl] !== undefined)
        {
            req.continue = false;
            res.writeHead(200,
            {
                'Content-type': req.HOST.ZONES[req.zone].shared[sUrl].mime,
                'Content-length': req.HOST.ZONES[req.zone].shared[sUrl].buffer.byteLength,
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': req.url, // "*"
                'X-Frame-Options': "SAMEORIGIN", // DENY, SAMEORIGIN, or ALLOW-FROM 
            });
            res.end(req.HOST.ZONES[req.zone].shared[sUrl].buffer);
        }
        else if(req.HOST.ZONES[req.zone] && req.HOST.ZONES[req.zone].conf.shared !== undefined )
        {
            var f = "";
            if ( req.url.indexOf("/" + req.zone) == 0)
            {
                f = req.url.replace("/" + req.zone, '');
            }
            else f = req.url;

            req.continue = false;
            f = req.HOST.ZONES[req.zone].path + req.zone + "/" + req.HOST.ZONES[req.zone].conf.shared + f;
            fs.stat(f, function(err, stat)
            {       
                if(err)
                {
                    next(req, res);
                }
                else if(stat.isFile())
                {
					var cLength = 0;
                    if( req.HOST.ZONES[req.zone].conf.cache
                       && UTILS.checkCache(req.HOST.ZONES[req.zone].conf.cache, f) )
                    {
                            var toAdd = {};
                            toAdd.buffer = fs.readFileSync(f);
							cLength = buffer.byteLength;
                            toAdd.mime = wf.mimeUtil.lookup(f);
                            toAdd.path = f;
                            toAdd.mtime = stat.mtime;
                            if(req.HOST.ZONES[req.zone].shared === undefined)
                                req.HOST.ZONES[req.zone].shared = {};
                            req.HOST.ZONES[req.zone].shared[sUrl] = toAdd;
                    }
					else if(req.HOST.ZONES[req.zone].shared && req.HOST.ZONES[req.zone].shared[sUrl])
					{
						cLength = req.HOST.ZONES[req.zone].shared[sUrl].buffer.byteLength;
					}
					else
					{
						cLength = fs.readFileSync(f).byteLength;
					}
                    res.writeHead(200,
                    {
                        'Content-type': wf.mimeUtil.lookup(f),
                        'Content-length': cLength,
                        'Cache-Control': 'public, max-age=3600',
                        'Access-Control-Allow-Origin': req.url, // "*"
                        'X-Frame-Options': "SAMEORIGIN", // DENY, SAMEORIGIN, or ALLOW-FROM 
                    });
                    fs.createReadStream(f).pipe(res);
                }
                else
                {
                    next(req, res);
                }
            });
        }
        return;
    }
}
