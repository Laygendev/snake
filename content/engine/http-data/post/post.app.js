/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.HttpPost = new PostHttp();

function PostHttp()
{
    var wf = WF();
	this.code = function(req, res)
	{
        req.post = {};
        if(req.method == "POST" || req.method == "PUT") 
        {
            //var tmp = req.rawPost;
            var tmp = req.postData;

            if(tmp !== undefined)
            {
				  var multipart = new wf.MultipartParser(req.headers['content-type'], tmp);
				  if(multipart.isMultipart)
				  {
					 for(var r in multipart.parts)
					 {
						req.post[r] = multipart.parts[r].body;
					 }
					 req.field = multipart.fields;
					 req.multipart = multipart.isMultipart;
				  }
				  else if(tmp.lastIndexOf != undefined && tmp.indexOf("{", 0) === 0)
				  {
					  try
					  {
						  req.post = JSON.parse(req.postData);
					  }
					  catch(e){}
				  }
				  else
				  {
					  tmp = tmp.toString();
					  var obj = tmp.split("&");
					  var objL = obj.length;
					  for(var o = 0; o < objL; o++)
					  {
						var t = obj[o].split("=");
						if(t[1] === undefined) t[1] = "";
						req.post[t[0]] = unescape(t[1].replace(/\+/gi, " "));
					  }
				  }

				  // PARSE JSON
				  for(var p in req.post)
				  {
					  if(req.post[p].indexOf && req.post[p].indexOf("{", 0) == 0)
					  {
						  try
						  {
							  var tmpJ = JSON.parse(req.post[p]);
							  req.post[p] = tmpJ;
						  }catch(e){ }
					  }
				  }
            }
		}
	}
}
