/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.httpUtil = new httpUtil();
UTILS.httpUtil = new httpUtil();

function httpUtil()
{
    this.getOption = function(str)
    {
        var result = {};
        var arr = str.split(";");
        for(var a in arr)
        {
            var tmp = arr[a].split(":");
            if(tmp[1])
                result[tmp[0]] = tmp[1];
        }
        return result;
    }
    
    this.httpGet = function(opt, cbError, cbOk, encoding)
    {
        if(!encoding) encoding = "utf8";
        opt.path = encodeURI(opt.path);
        var get = http.request(opt);
        get.on("error", function(err)
        {
            cbError(err);

        });
        get.on("response", function(response)
        {
            var data = "";
            response.on("data", function(chunk)
            {
                data += chunk.toString(encoding);
            });
            response.on("end", function()
            {
                cbOk(data);
            });
        });
        get.end();
        return;
    }
    
     this.httpGetPipe = function(opt, cbError,cbPipe, cbOk)
    {
        opt.path = encodeURI(opt.path);
        var get = http.request(opt);
        get.on("error", function(err)
        {
            cbError(err);

        });
        get.on("response", function(response)
        {
            if(cbPipe)
                cbPipe(response);
            response.on("end", function()
            {
                if(cbOk)
                    cbOk();
            });
        });
        get.end();
        return;
    }
     
    this.dataSuccess = function(req, res, message, data, version)
    {
        req.continue = false;
        var result = 
        {
            success: true,
            status: "Ok",
            message: message,
            code: 0,
            ask: req.url,
            data: data,
            version: version,
            date: new Date(Date.now()),
        }
        res.end(JSON.stringify(result));
     }
     
    this.dataError = function(req, res, status, message, code, version)
    {
        req.continue = false;
        var result = 
        {
            success: false,
            status: status,
            code: code,
            message: message,
            ask: req.url,
            data: null,
            version: version,
            date: new Date(Date.now()),
        };
        res.end(JSON.stringify(result));
     }
     
}