// CREATE SINGLETON
var single;

// SINGLETON CLASS
var singleton = function singleton()
{
    if(getCaller() != singleton.getInstance)
	{
		for(var i in this)
		{
		  delete this[i];
		}
  }
}

// GET SINGLETON CALLER
function getCaller()
{
  try
  {
    var err = new Error();
    var callerfile;
    var currentfile;

    Error.prepareStackTrace = function (err, stack) { return stack; };

    currentfile = err.stack.shift().getFileName();

    while (err.stack.length)
    {
      callerfile = err.stack.shift().getFileName();

      if(currentfile !== callerfile) return callerfile;
    }
  } catch (err) {}
  return undefined;
}

// GET SINGLETON INSTANCE
var getInstance = function()
{
    var caller = getCaller();
    if(caller !== undefined && single !== undefined && caller.indexOf(single.CONF['HOST_FOLDER']) > -1)
    {
      var srv = caller.split(single.CONF['SRV_FOLDER'])[1].split('/')[0];
      var host = caller.split(single.CONF['HOST_FOLDER'])[1].split('/')[0];
      var result = 
      {
          HOST: single.SERVERS[srv].HOSTS[host],
      };
        return result;
    }

    else if(single === undefined)
    {
        single = new singleton();
    }
    return single;
}

module.exports = getInstance;
