/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.LoadProcess = LoadProcess;
var wf = WF();

function Process(_path, _name)
{
	this.path = _path + _name + "/";
	this.name = _name;

	this.checkProcess = function()
	{
		this.process = this.path + this.name + wf.CONF['PROCESS_END'];
		var file = this.path + this.name + wf.CONF['CONFIG_END'];
		if(fs.existsSync(file))
		{
			this.processState = true;
			this.conf = new ProcessConf(_path, _name);
		}
		else this.processState = false;
	}

	/* FONCTION DECLARATIONS */
	this.checkProcess();
	this.conf = new ProcessConf(_path, _name);
	/*************************/
}

function ProcessConf(_path, _name)
{
		this.path = _path + _name + "/";
		this.name = _name;
		this.config = { "state": true, "pos": 100, restart: 'none', 'attempt': 5, 'delay': 3000, 'started': 10000, 'wait': false, cmd:'', args: [], options: {} };

	this.readConf = function()
	{
		var file = this.path + this.name + wf.CONF['CONFIG_END'];
		if(fs.existsSync(file))
		{
			var processConf = require(file);
			for(var prop in processConf)
			{
				for(var index in processConf[prop])
				{
					this.config[index] = processConf[prop][index];
				}
			}
		}
	}
	this.checkState = function(state)
	{
		if(state == "true") this.config['state'] = true;
		else this.config['state'] = false;
	}
	this.checkPos = function(pos)
	{
		if(!isNan(this.config['pos'])) this.config['pos'] = parseInt(pos);
	}

	/* FONCTION DECLARATIONS */
	this.readConf();
	/*************************/
}

function LoadProcess()
{
	wf.PROCESS = {};
  var sArr = [];
  var c = wf.CONF['PROCESS_PATH'];
  if(fs.existsSync(c) && fs.lstatSync(c).isDirectory())
  {
    var dArr = fs.readdirSync(c);
    dArr.forEach(function(d)
	 {
	   if (fs.lstatSync(c +'/' + d).isDirectory() && d != "." && d != "..")
	   {
		 var proc = new Process(c, d);
		 if(proc.processState && proc.conf.config['state'])
		 {
			if(proc.process !== undefined && fs.existsSync(proc.process))
			{
			   var sFile = require(proc.process);
			   for(var prop in sFile)
			   {
				 for(var index in sFile[prop])
				 {
				   proc[index] = sFile[prop][index];
				 }
			   }
			}
			sArr.push(proc);
		 }
	   }
	 });

    sArr.sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
  }

	//wf.PROCESS = sArr;

  var sL = sArr.length;
  for( var i = 0; i < sL; i++)
  {
	  var wait = sanitInt(sArr[i].conf.config.wait, false);
	  manageProcess(sArr[i], wait);
  }
}

function manageProcess(proc, wait)
{
	if(wait === false)
	{
		setImmediate(function()
		{
			startProcess(proc)
		});
	}
	else
	{
		var delay = sanitInt(proc.conf.config.delay, 3000);
		setTimeout(function()
		{
			startProcess(proc);
		}, delay);
	}

}

function startProcess(proc)
{
	var NAME = proc.name;
    if( proc.conf.config.cmd !== undefined)
    {
		if(proc.restarted === undefined) proc.restarted = 0;

		var level = getLog(proc.conf.config.log);
		var logPath = wf.CONF['LOG_PATH'] + wf.CONF['PROCESS_FOLDER'] + NAME + "/" ;

		var logOut = logPath + NAME + wf.CONF['OUT_END'];
		var logErr = logPath + NAME + wf.CONF['LOG_END'];

		// TEST INIT IF EXISTS
		if(proc.init !== undefined && typeof proc.init == 'function')
		{
			var init = proc.init();
			if(!init.start)
			{
				var mInit = "[!] Init error in " + NAME + " - " + init.message;
				wf.Log(mInit);
				wf.wLog(logErr, mInit + EOL);
				return;
			}
			else
			{
				var mInit = "[!] Init message in " + NAME + " - " + init.message;
				wf.Log(mInit);
				if(level > 0 && level < 3)
					wf.wLog(logOut, mInit + EOL);
			}
		}

		var eProc = spawn(proc.conf.config.cmd, proc.conf.config.args, proc.conf.config.options);

		wf.PROCESS[NAME] =
		{

			init: proc,
			handle: eProc,

		}

		var sProc = proc;

		// SET RESTARTED TO 0 AFTER 10 SEC
		var started = sanitInt(proc.conf.config.started, 10000);
		var to = setTimeout(function()
		{
			if(eProc !== undefined)
			{
				sProc.restarted = 0;
			}
		}, started);

		// ON STDOUT
		eProc.stdout.on('data', function (data)
		{
			if(level > 0 && level < 3)
			{
				wf.wLog(logOut, data);
			}
			//wf.Log('stdout: ' + data);
		});
		// ON STDERR
		eProc.stderr.on('data', function (data)
		{
			if(level > 0)
			{
				wf.wLog(logErr, data + os.EOL);
			}
			wf.Error('stderr: ' + data + os.EOL);
		});
		// ON CLOSE
		eProc.on('close', function (code)
		{
			clearTimeout(to);
			var end = NAME + ' exited with code : ' + code + os.EOL;
			if(level > 0)
			{
				wf.wLog(logErr, end);
			}
			wf.Log(end);

			if(sProc.conf.config.restart == 'auto' && (sProc.conf.config.attempt == 0 || sProc.restarted < sProc.conf.config.attempt) )
			{
				var delay = sanitInt(sProc.conf.config.delay, 3000);
				sProc.restarted = sProc.restarted + 1;
				var rMess = "Restarting attempts : " + sProc.restarted + " - " + NAME + os.EOL;

				wf.Log(rMess);
				wf.wLog(logErr, rMess);

				setTimeout(function()
				{
					startProcess(sProc);
				}, delay);
			}
		});
    }
}

// SANIT INT FOR SETTIMEOUT
function sanitInt(value, def)
{
	var res = value | 0;
	if(res == 0) res = def;
	return res;
}

function sanitBool(value, def)
{
	var res = value | false;
	if(res == false) res = def;
	return res;
}

function getLog(str)
{
	if(str === undefined || str === "none") return 0;
	if(str === "all") return 1;
	if(str === "info") return 2;
	if(str === "error") return 3;
}
