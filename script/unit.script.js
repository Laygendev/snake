'use strict'

// DEFINE GLOBAL WF VAR
global.UTILS = {};
global.WF = require('../start/singleton.js');
var wf = WF();
wf.CONF = {};
wf.CONF["MAIN_PATH"] = __dirname + "/../";
wf.CONF["BASE_PATH"] = wf.CONF["MAIN_PATH"] + "base" + "/";

// Get global var
require('../start/load.start.js');

wf.Load.Base("conf", wf.CONF['MAIN_PATH']);


// CREATE GLOBAL WF CONF


require('../conf/test.conf.js');

var test = wf.CONF['TEST_END'];

// start test 
checkTest(wf.CONF['MAIN_PATH'], doTest);

function doTest(err, results)
{
	if(err)
	{
		throw err;
	}
	else
	{
		var j = results.length;
		for(var i = 0; i < j; i++)
		{
				require(results[i]);
		}
	}
}

function checkTest(dir, done) 
{
  var results = [];
  fs.readdir(dir, function(err, list) 
  {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) 
	{
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) 
	  {
        if (stat && stat.isDirectory()) 
		{
          checkTest(file, function(err, res) 
		  {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else 
		{
			if(endsWith(file, test))
				results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};


function endsWith(haystack, needle)
{
  return haystack.indexOf(needle, haystack.length - needle.length) !== -1;
}