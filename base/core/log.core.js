/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Log = Log;
module.exports.wLog = wLog;
module.exports.Error = Error;
var wf = WF();

function Log(str)
{

	if(wf.CONF.DEBUG == true)
	{
		console.log("[+] " + new Date() + " - " + str);
	}
}

function Error(str)
{
	if(wf.CONF.ERROR == true)
	{
		console.log("[!] " + new Date() + " - " + str);
	}
}

function wLog(lPath, str)
{
	var p = lPath;
	var s = str;
	setImmediate(function()
	{
		if(!fs.existsSync( path.dirname(p) ))
		{
			wf.mkdirp(path.dirname(p));
			
		}
		if( fs.existsSync( path.dirname(p) ) && !fs.existsSync(p) )
		{
			fs.writeFileSync(p, "");
		}
		if(fs.existsSync(p))
		{
			s = new Date() + " - " + s;
			fs.appendFile(p, s);
		}
	});
}