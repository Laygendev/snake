/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.LoadScripts = LoadScripts;
var wf = WF();

function Script(_path, _name)
{
    this.path = _path + _name + "/";
    this.name = _name;

    this.checkScript = function()
    {

        var file = this.path + this.name + wf.CONF['SCRIPT_END'];
        if(fs.existsSync(file))
        {
            this.scriptState = true;
            this.script = file;
            this.conf = new ScriptConf(_path, _name);
        }
        else this.scriptState = false;
    }


    /* FONCTION DECLARATIONS */
    this.checkScript();
    this.conf = new ScriptConf(_path, _name);
    /*************************/
}

function ScriptConf(_path, _name)
{
    this.path = _path + _name + "/";
    this.name = _name;
    this.config = { "state": true, "pos": 100, 'day':'*', date:'*', 'month':'*', 'hour':'0', 'minute':'0' };

	this.readConf = function()
	{
		var file = this.path + this.name + wf.CONF['CONFIG_END'];
		if(fs.existsSync(file))
		{
			var scriptConf = require(file);
			for(var prop in scriptConf)
			{
				for(var index in scriptConf[prop])
				{
					this.config[index] = scriptConf[prop][index];
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

function LoadScripts()
{
    var sArr = [];
    var c = wf.CONF['SCRIPT_PATH'];
    if(fs.existsSync(c) && fs.lstatSync(c).isDirectory())
    {
        var dArr = fs.readdirSync(c);
        dArr.forEach(function(d)
         {
           if (fs.lstatSync(c +'/' + d).isDirectory() && d != "." && d != "..")
           {
             var script = new Script(c, d);
             if(script.scriptState && script.conf.config['state'])
             {
               var sFile = require(script.script);
               for(var prop in sFile)
               {
                 for(var index in sFile[prop])
                 {
                   script[index] = sFile[prop][index];
                 }
               }
               sArr.push(script);
             }
           }
         });
        sArr.sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
    }
    wf.SCRIPT = sArr;
}

