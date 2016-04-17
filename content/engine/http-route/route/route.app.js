/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.httpRouteEngine = new httpRouteEngine();

function httpRouteEngine()
{    
    var wf = WF();
    this.code = function(req, res)
    {
        var route = wf.Router.match(req);
        if(route && route.fn)
        {
            req.continue = false;
            req.param = route.param;
            req.splat = route.splat;
            var l = route.fn.length;
            for(var i = 0; i < l; i++)
                route.fn[i](req, res);
        }
        else if(req.loop == (req.app.length - 1))
        {
            req.continue = false;
            res.end();
        }
    }
}