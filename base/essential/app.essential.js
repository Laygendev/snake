/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.Launch = Launch;
module.exports.LoadApps = LoadApps;
module.exports.LoadHooks = LoadHooks;
module.exports.LoadEngines = LoadEngines;
module.exports.LoadModels = LoadModels;
global.next = function(req, res)
{
  UTILS.LoopExec(req, res);
}
var wf = WF();

function App(_path, _name)
	{
			/* CONSTRUCTOR 	*/
			this.path = _path + _name + "/";
			this.name = _name;
				this.view = {}
			/*				*/


			this.checkApp = function()
			{
				var file = this.path + this.name + wf.CONF['APP_END'];

				if(fs.existsSync(file))
				{
					this.appState = true;
					this.app = file;
				}
				else this.appState = false;
			}

      this.loadViews = function()
      {

        var v = this.path + this.conf.config.view + "/";
        if(fs.existsSync(v) && fs.lstatSync(v).isDirectory())
        {
			var dArr = fs.readdirSync(v);
			var darrL = dArr.length;
            for(var d = 0; d < darrL; d++)
            {
                if(dArr[d].endsWith(wf.CONF['VIEW_END']))
                {
                  var ind = dArr[d].replace(wf.CONF['VIEW_END'], "");
                  this.view[ind] = fs.readFileSync(v + dArr[d]);
                }
            } 
        }
      }

			this.checkApp();
			this.conf = new AppConf(_path, _name);
            this.loadViews();
	}
	function AppConf(_path, _name)
	{
		this.path = _path;
		this.name = _name;
		this.config = { "state" : true, "pos" : 0, "view": "view", "version": "0.0" };

		this.readConf = function()
		{
			var file = this.path + "/" + this.name + "/" + this.name + wf.CONF['CONFIG_END'];
			if(fs.existsSync(file))
			{

        try
        {
          var appConf = require (file);
				  for(var prop in appConf)
				  {
  					for(var index in appConf[prop])
            {
              this.config[index] = appConf[prop][index];
            }
          }
        }
        catch(e)
        {
          console.log("[!] Error conf : " + file);
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

		this.readConf();
	}

	function getAppArray(p)
	{
		var aArr = [];
		var c = wf.CONF['APP_PATH'] + p + "/";
		if(fs.existsSync(c) && fs.lstatSync(c).isDirectory())
		{
			var dArr = fs.readdirSync(c);
			dArr.forEach(function(d)
			{
				if (fs.lstatSync(c +'/' + d).isDirectory() && d != "." && d != "..")
				{
					var app = new App(c, d);
					if(app.appState && app.conf.config['state'])
					{
						app.conf.config.place = p;
						aArr.push(app);
					}
				}
			});
			aArr.sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
		}
		return aArr;
	}

// request; response
function Launch(req, res)
{
      var app = req.app[req.loop];
      // IF HOOK NOT THE SAME RIGHTS
      var env = {};
      if(!app.hooked)
      {
          req.SERVER = wf.SERVERS[req.srv];
      }
      if(app.exec.code)
      {
        app.exec.code(req, res);
      }
}

function LoadEngines()
{
   var pDir = wf.CONF['ENGINE_PATH']

   if(fs.existsSync(pDir) && fs.lstatSync(pDir).isDirectory())
   {
     wf.ENGINES = {};
     var pArr = fs.readdirSync(pDir);
     var pArrL = pArr.length;
     for(var p = 0; p < pArrL; p++)
     {
       wf.ENGINES[pArr[p]] = [];
       var tmpD = pDir + pArr[p] + "/";
       var tmpA = fs.readdirSync(tmpD);
       var tL = tmpA.length;
       for(var m = 0; m < tL; m++)
       {
         var mTmp = new App(tmpD, tmpA[m]);
         if(mTmp.appState && mTmp.conf.config['state'])
         {
           var cTmp = require(tmpD + mTmp.name + "/" + mTmp.name + wf.CONF['APP_END']);
           var eTmp = {}
           for( var c in cTmp)
           {
             for(var f in cTmp[c])
             {
               if(typeof(cTmp[c][f]) == "function")
                 eTmp[f] = cTmp[c][f];
             }
           }
               /*

                LOAD EXEC VAR

              */
              if(eTmp.code !== undefined && typeof eTmp.code === "function") eTmp.execute = true;
              eTmp.path = mTmp.conf.path + mTmp.name + "/";
              eTmp.conf = mTmp.conf;

          // LOAD IN ARRAY
           wf.ENGINES[pArr[p]].push({'path': tmpD, 'name': mTmp.name, 'conf': mTmp.conf, 'place': pArr[p], 'exec': eTmp, 'view': mTmp.view });
         }
       }
       wf.ENGINES[pArr[p]].sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
       var result = wf.ENGINES[pArr[p]];
       wf.ENGINES[pArr[p]] = {};
       var pL = result.length;
       for(var i = 0; i < pL; i++)
       {
         if(result[i] !== undefined)
         {
           wf.ENGINES[pArr[p]][result[i].name] = result[i];
         }
       }
     }
   }
}

function LoadApps()
{
  if(wf.SERVERS !== undefined)
  {
    for(var s in wf.SERVERS)
    {
      if(wf.SERVERS[s] !== undefined)
      {
		  var pDir = wf.CONF['SRV_PATH'] + s + '/' + wf.CONF['APP_FOLDER'];
		  if(fs.existsSync(pDir) && fs.lstatSync(pDir).isDirectory())
		  {
			wf.SERVERS[s].APPS = {};
			var pArr = fs.readdirSync(pDir);
			var pArrL = pArr.length;
			for(var p = 0; p < pArrL; p++)
			{
			  wf.SERVERS[s].APPS[pArr[p]] = [];
			  var tmpD = pDir + pArr[p] + "/";
			  var tmpA = fs.readdirSync(tmpD);
			  var tL = tmpA.length;
			  for(var m = 0; m < tL; m++)
			  {
				var mTmp = new App(tmpD, tmpA[m]);
				if(mTmp.appState && mTmp.conf.config['state'])
				{
				  var cTmp = require(tmpD + mTmp.name + "/" + mTmp.name + wf.CONF['APP_END']);
				  var eTmp = {}
				  for( var c in cTmp)
				  {
                    for(var f in cTmp[c])
                    {
                      if(typeof(cTmp[c][f]) == "function")
                      eTmp[f] = cTmp[c][f];
                    }
				  }
                  /*

                    LOAD EXEC VAR

                  */
                  if(eTmp.code !== undefined && typeof eTmp.code === "function") eTmp.execute = true;
                  eTmp.path = mTmp.conf.path + mTmp.name + "/";
                  eTmp.conf = mTmp.conf;

                    // LOAD IN ARRAY
				  wf.SERVERS[s].APPS[pArr[p]].push(
				  {
					  'path': tmpD, 'name': mTmp.name, 'conf': mTmp.conf, 'place': pArr[p], 'exec': eTmp, 'view': mTmp.view,
				  });
				}
			  }
			  wf.SERVERS[s].APPS[pArr[p]].sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
			  var result = wf.SERVERS[s].APPS[pArr[p]];
			  wf.SERVERS[s].APPS[pArr[p]] = result;
			}
		  }
      }
    }
  }
}

function LoadHooks()
{
  if(wf.SERVERS !== undefined)
  {

    for(var s in wf.SERVERS)
    {

      if(wf.SERVERS[s].HOSTS !== undefined)
      {

        for(var h in wf.SERVERS[s].HOSTS)
        {

          if(wf.SERVERS[s].HOSTS[h] !== undefined && wf.SERVERS[s].HOSTS[h].name !== undefined)
		  {

			 var hArr = {};

			 wf.SERVERS[s].HOSTS[h].HOOKS = {};
			 var p = wf.SERVERS[s].HOSTS[h].path + wf.SERVERS[s].HOSTS[h].name + "/" + wf.CONF['PLUGIN_FOLDER'];

			 if(fs.existsSync(p) && fs.lstatSync(p).isDirectory())
			 {
			   var dArr = fs.readdirSync(p);
			   dArr.forEach(function(d)
				{
				  if (fs.lstatSync(p +'/' + d).isDirectory() && d != "." && d != "..")
				  {
            var app = new App(p, d);
            if(app.appState && app.conf.config['state'] && app.conf.config.hook !== undefined)
            {
              // CHARGEMENT DU HOOK ET FONCTIONS
              var cTmp = require(p + app.name + "/" + app.name + wf.CONF['APP_END']);
              var eTmp = {}
              for( var c in cTmp)
              {
                for(var f in cTmp[c])
                {
                  if(typeof(cTmp[c][f]) == "function")
                  eTmp[f] = cTmp[c][f];
                }
              }

               /*

                LOAD EXEC VAR

              */
              if(eTmp.code !== undefined && typeof eTmp.code === "function") eTmp.execute = true;
              if(eTmp.runOnce && process.env.wrkId && process.env.wrkId == 0)
              {
                  eTmp.runOnce();
              }
              eTmp.path = app.conf.path + app.name + "/";
              eTmp.conf = app.conf;
              eTmp.load = function(v)
              {
                if(app.view[v] !== undefined)
                {
                   UTILS.LoopExec(eTmp.exec.req, eTmp.exec.res);
                }
              }

            eTmp.getView = function(v)
            {
              if(app.view[v] !== undefined)
              {
                return app.view[v];
              }
            }


            // LOAD IN ARRAY
            if(hArr[app.conf.config.hook] === undefined) hArr[app.conf.config.hook] = [];
            hArr[app.conf.config.hook].push({'name': app.name, 'hooked': true, 'conf': app.conf, 'exec': eTmp, 'view': app.view });





            }
				  }
				});

			   for(var o in hArr)
			   {
				 hArr[o].sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
				 wf.SERVERS[s].HOSTS[h].HOOKS[o] = hArr[o];
			   }
			 }
          }
        }
      }
    }
  }
}

function LoadModels()
{
  if(wf.SERVERS !== undefined)
  {

    for(var s in wf.SERVERS)
    {

      if(wf.SERVERS[s].HOSTS !== undefined)
      {

        for(var h in wf.SERVERS[s].HOSTS)
        {

          if(wf.SERVERS[s].HOSTS[h] !== undefined && wf.SERVERS[s].HOSTS[h].name !== undefined)
		  {
			wf.SERVERS[s].HOSTS[h].MODELS = {};
			var p = wf.SERVERS[s].HOSTS[h].path + wf.SERVERS[s].HOSTS[h].name + "/" + wf.CONF['MODEL_FOLDER'];

			var mArr = (wf).Load.loadFiles(wf.CONF['MODEL_END'], p, true);
            if(mArr != undefined && mArr != null)
            {
			     var j = mArr.length;
			     for(var i = 0; i < j; i++)
			     {
				        var mTmp = require(p + mArr[i]);
				        for( var m in mTmp)
				        {
					       wf.SERVERS[s].HOSTS[h].MODELS[m] = mTmp[m];
				        }
			     }
            }
          }
        }
      }
    }
  }
}

/******************************* APP UTILS **********************************/
global.loadView = function(req, res, v)
{
    if(req.app[req.loop].view[v] !== undefined)
    {
      res.tpl.inner += req.app[req.loop].view[v];
    }
}
global.getView = function(req, res, v)
{
    if(req.app[req.loop].view[v] !== undefined)
    {
      return req.app[req.loop].view[v];
    }
}
global.endView = function(req, res, v)
{
    req.continue = false;
    if(req.app[req.loop].view[v] !== undefined)
    {
      res.end(req.app[req.loop].view[v]);
    }
    else res.end("Undefined view");
}
/****************************************************************************/