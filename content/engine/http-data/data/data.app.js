/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.dataEngine = new dataEngine();
var wf = WF();

function dataEngine()
{

	this.code = function(req, res)
	{
        req.postData = "";
        
        req.on("error", function(err)
        {
            req.destroy();
        });

        req.on("clientError", function(err)
        {
            req.destroy();
        });
        
        if(req.method != "POST" && req.method != "PUT") 
        {
            return;
        }
        else
        {
            try
            {
                var cl = parseInt(req.headers['content-length']);
                if(cl > wf.CONF['MAX_POST_SIZE'])
                {
                    res.destroy();
                }
                else
                {
                     req.on("data", function(d)
                    {                         
                        try
                        {
                            req.postData += d.toString("binary");
                        }catch(e){}
                         
                        if(req.postData.length > wf.CONF['MAX_POST_SIZE'] )
                        {
                            res.destroy();
                        }
                    });

                    var root = this;
                    req.on("end", function()
                    {
                        next(req, res);
                    });
                }
            }
            catch(e)
            {
                 res.destroy();
            }
            req.continue = false;
        }
	}
}
