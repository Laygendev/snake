/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.send404 = new send404();

function send404()
{
    var wf = WF();
    this.code = function(req, res)
    {
        req.continue = false;
        if(req.HOST.conf['404'])
        {
            wf.Redirect(res, req.HOST.conf['404']);
        }
        else
        {
            res.writeHead(404,
            {
                'Content-type': "text/html",
            });
            res.end("<h1>404 ERROR</h1>");
        }
    }
    
}