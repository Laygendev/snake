/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.hookMod = hookMod;
module.exports.LoadMods = LoadMods;
UTILS.hookMod = hookMod;
var wf = WF();

function Module(_path, _name)
{
		this.path = _path + _name + "/";
		this.name = _name;
    this.view = {};

		this.checkModule = function()
		{
			var file = this.path + this.name + WF().CONF['MOD_END'];
			if(fs.existsSync(file))
			{
				this.modState = true;
				this.mod = file;
			}
			else this.modState = false;
		}

    this.loadViews = function()
    {

      var v = this.path + this.conf.config.view + "/";
      if(fs.existsSync(v) && fs.lstatSync(v).isDirectory())
      {
        var dArr = fs.readdirSync(v);
	      var dArrL = dArr.length;
        for(var d = 0; d < dArrL; d++)
        {
          if(dArr[d].endsWith(WF().CONF['VIEW_END']))
          {
            var ind = dArr[d].replace(WF().CONF['VIEW_END'], "");
            this.view[ind] = fs.readFileSync(v + dArr[d]);
          }
        }
      }
    }


		this.checkModule();
		this.conf = new ModConf(_path, _name);
    this.loadViews();
}

function ModConf(_path, _name)
{
		this.path = _path;
		this.name = _name;
  this.config = { "state": true, "pos": 0, "css": "", "view": "view" };


		this.readConf = function()
		{
			var file = this.path + "/" + this.name + "/" + this.name + WF().CONF['CONFIG_END'];
			if(fs.existsSync(file))
			{
				try
        {
          var modConf = require (file);
				  for(var prop in modConf)
				  {
  					for(var index in modConf[prop])
            {
              this.config[index] = modConf[prop][index];
            }
          }
        }
        catch(e)
        {
          console.log("[!] Error conf : " + file);
        }
        /*
        try
        {
          var tmp = JSON.parse(fs.readFileSync(file));
          for(var index in tmp)
          {
            this.config[index] = tmp[index];
          }
        }
        catch(e)
        {
          console.log("[!] Error conf : " + file);
        }
        */
			}
		}

		this.readCss = function()
		{
			var file = this.path + "/" + this.name + "/" + this.name + WF().CONF['CSS_END'];
			if(fs.existsSync(file))
			{
				this.config['css'] = file;
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
		this.readCss();

	}

function getModulesArray(p, c)
{
	var mArr = [];

	if(c === undefined) c = WF().CONF['MAIN_PATH'] + WF().CONF['CONTENT_FOLDER'] + WF().CONF['ZONE_FOLDER'] + WF().TPL.zone + '/' + WF().CONF['MOD_FOLDER'] + p + "/";
  else c = c + p + "/";

	if(fs.existsSync(c) && fs.lstatSync(c).isDirectory())
	{
		var dArr = fs.readdirSync(c);
		dArr.forEach(function(d)
		{
			if (fs.lstatSync(c + '/' + d).isDirectory())
			{
				var mod = new Module(c, d);
				if( mod !== undefined && mod.modState && mod.conf.config['state']) {  mArr.push(mod); }
			}
		});
	}
	mArr.sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
	return mArr;
}

function hookMod(req, res, p)
{
	if(!req.srv || !req.host || !req.zone) return;
    var mArr = wf.SERVERS[req.srv].HOSTS[req.host].ZONES[req.zone].MODS[p];
    req.modPath = p;
	for(var mod in mArr)
	{   
        req.mod = mArr[mod].name;
        var exec = wf.Clone(mArr[mod].exec);
        exec.path = mArr[mod].path + "/" + mArr[mod].name + "/";
	    if(exec.code) exec.code(req, res);
	}
}

function hookCss(css)
{
    if(fs.existsSync(css) && fs.lstatSync(css).isDirectory())
	{
		var end = WF().CONF['CSS_END'];
		var cArr = fs.readdirSync(css);
    var cArrL = cArr.length;

    for(var d = 0; d < cArrL; d++)
		{
			if(cArr[d] != "." && cArr[d] != "..")
			{
				var c = css + cArr[d];
				if(fs.existsSync(c) && fs.lstatSync(c).isDirectory())
				{
					var mArr = fs.readdirSync(c);
          var mArrL = mArr.length;

					var c2 = c;
          for(var e = 0; e < mArrL; e++)
					{
						if (fs.lstatSync(c2 + '/' + mArr[e]).isDirectory() && mArr[e] != "." && mArr[e] != "..")
						{
              var mod = new Module(c2, mArr[e]);
							if(mod.conf.config['css'].length > 0 && fs.existsSync(mod.conf.config['css']) && mod.modState && mod.conf.config['state'])
							{
								var cMod = require(mod.conf.config['css']);
								var cModL = cMod.length;
								for(var c = 0; c < cModL; c++)
								{
									cMod[c].path = c2 + '/' + e + "/";
									if(cMod[c].code !== undefined) cMod[c].code();
								}
							}
						}
					}
				}
			}
		}
	}
}

function LoadMods()
{
  for(var s in WF().SERVERS)
  {
    for(var h in WF().SERVERS[s].HOSTS)
    {
      for(var z in WF().SERVERS[s].HOSTS[h].ZONES)
      {
        var pDir = WF().CONF['SRV_PATH'] + s + "/" + WF().CONF['HOST_FOLDER'] + WF().SERVERS[s].HOSTS[h].name + "/" + WF().CONF['ZONE_FOLDER'] + WF().SERVERS[s].HOSTS[h].ZONES[z].name + '/'  + WF().CONF['MOD_FOLDER'];

        if(fs.existsSync(pDir) && fs.lstatSync(pDir).isDirectory())
        {
          WF().SERVERS[s].HOSTS[h].ZONES[z].MODS = {};
          var pArr = fs.readdirSync(pDir);
          var pArrL = pArr.length;

          for(var p = 0; p < pArrL; p++)
          {

            WF().SERVERS[s].HOSTS[h].ZONES[z].MODS[pArr[p]] = [];

            var tmpD = pDir + pArr[p] + "/";
            var tmpA = fs.readdirSync(tmpD);
            var tL = tmpA.length;

            for(var m = 0; m < tL; m++)
            {

              var mTmp = new Module(tmpD, tmpA[m]);
              if(mTmp.modState && mTmp.conf.config['state'])
              {
                var cTmp = require(tmpD + mTmp.name + "/" + mTmp.name + WF().CONF['MOD_END']);
                var eTmp = {}
                for( var c in cTmp)
                {
                  for(var f in cTmp[c])
                  {
                    if(typeof(cTmp[c][f]) == "function")
                    eTmp[f] = cTmp[c][f];
                  }
                }

                eTmp.ZONE = WF().SERVERS[s].HOSTS[h].ZONES[z];

                WF().SERVERS[s].HOSTS[h].ZONES[z].MODS[pArr[p]].push({'path': tmpD, 'name': mTmp.name, 'conf': mTmp.conf, 'exec': eTmp, 'view': mTmp.view });
              }
            }
            WF().SERVERS[s].HOSTS[h].ZONES[z].MODS[pArr[p]].sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
            var result = WF().SERVERS[s].HOSTS[h].ZONES[z].MODS[pArr[p]];
            WF().SERVERS[s].HOSTS[h].ZONES[z].MODS[pArr[p]] = {};
            var pL = result.length;
            for(var i = 0; i < pL; i++)
            {
               if(result[i] !== undefined)
               {

                 WF().SERVERS[s].HOSTS[h].ZONES[z].MODS[pArr[p]][result[i].name] = result[i];
               }
            }
          }
        }
      }
    }
  }
}

/******************************* MOD UTILS ******************************/
UTILS.LoadMod = function(req, res, v)
{
    var view = req.HOST.ZONES[req.zone].MODS[req.modPath][req.mod].view;
    if(view[v] !== undefined)
    {
      res.tpl.inner += view[v];
    }
}
UTILS.GetModView = function(req, res, v)
{
    var view = req.HOST.ZONES[req.zone].MODS[req.modPath][req.mod].view;
    if(view[v] !== undefined)
    {
      return view[v];
    }
}
UTILS.EndMod = function(req, res, v)
{
    if(req.HOST.ZONES[req.zone].MODS[req.modPath][req.mod].view[v] !== undefined)
    {
      res.end(req.HOST.ZONES[req.zone].MODS[req.modPath][req.mod].view[v]);
    }
    else res.end("Undefined view");
}
/****************************************************************************/