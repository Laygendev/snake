var wf = WF();
wf.TMP = {};

// GET CURRENT NODE VERSION
var nv = getNodeVersion();

// REQUIRE STD Object

GLOBAL.cluster = require('cluster');
GLOBAL.os = require('os');
GLOBAL.child_process = require('child_process')
GLOBAL.exec = child_process.exec;
GLOBAL.spawn = child_process.spawn;
GLOBAL.execFile = child_process.execFile;
GLOBAL.fs = require('fs');
GLOBAL.http = require('http');
GLOBAL.https = require('https');
if( nv.major == 0 || (nv.major == 1 && nv.minor < 12) ){GLOBAL.http.setMaxHeaderLength(10000000);} // SET HTTP MAXHEADER
GLOBAL.http.globalAgent.maxSockets = Infinity;
GLOBAL.path = require('path');
GLOBAL.net = require('net');
GLOBAL.url  = require('url');
GLOBAL.querystring = require('querystring');
GLOBAL.zlib  = require('zlib');
GLOBAL.crypto = require('crypto');

GLOBAL.cluster = require('cluster');
GLOBAL.extend = require('util')._extend;
GLOBAL.events = require('events');
GLOBAL.stream = require("stream");
wf.eventEmitter = new events.EventEmitter();
GLOBAL.EOL = os.EOL;

// CREATE UTILS OBJECT
GLOBAL.UTILS = {};

wf.Default = function(arg, def)
{
	if(arg === undefined) return def;
	else return arg;
}
UTILS.Default = wf.Default;

wf.DefaultStr = function(arg)
{
	return wf.Default(arg, "");
}
UTILS.DefaultStr = wf.DefaultStr;

wf.Redirect = function(res, url)
{
		res.writeHead(302, 
        {
			'Location': url
		});
	res.stop = true;
	res.end("");
}
UTILS.Redirect = wf.Redirect;

wf.Clone = function(obj)
{
  return Object.create(obj);
}
UTILS.Clone = wf.Clone;

wf.Load = new function(){

	/* PUBLIC */
	this.Base = function(path, cpath)
	{
		var bpath = "";
		if(cpath === undefined)
			bpath = wf.CONF['BASE_PATH'] + path + "/";
		else bpath = cpath + path + "/";
		var files = this.loadFiles(path, bpath);
		if(files !== undefined)
		{
			files.forEach(function(file)
			{
				var t = require(bpath + file);
				for(var prop in t)
				{
					(wf)[prop] = t[prop];
				}
			});
		}
	}

	this.loadFiles = function(path, bpath, complete)
	{
		if(complete === undefined) complete = false;
		if(fs.existsSync(bpath))
		{
			return fs.readdirSync(bpath).filter(function (file)
			{
				var ext = "";
				if(!complete)
				{
					ext = "." + path + ".js";
				}
				else
				{
					ext = path;
				}
				if(file.substr(-(ext.length)) === ext)
					return fs.statSync(bpath + file).isFile();
			});
		}
	}
    
    /* PRIVATE */
	function getDirectories() {
	  return fs.readdirSync(wf.CONF['BASE_PATH'] + path).filter(function (file) {
		return fs.statSync(wf.CONF['BASE_PATH'] + path + '/' + file).isDirectory();
	  });
	}
};

function getNodeVersion()
{
	var v = process.version;
	v = v.split('.');
	var res =
	{
		major: v[0],
		minor: v[1],
		rev: v[2],
	}
	return res;
}
