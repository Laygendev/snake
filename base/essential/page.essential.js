/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.LoadPages = LoadPages;
module.exports.CreatePage = CreatePage;
module.exports.AddPage = addPage;
UTILS.AddPage = addPage;
var wf = WF();

function Page(_path, _name)
{
			this.path = _path + _name + "/";
			this.name = _name;
            this.view = {};

			this.checkPage = function()
			{

				var file = this.path + this.name + wf.CONF['PAGE_END'];
				if(fs.existsSync(file))
				{
					this.pageState = true;
					this.page = file;
					this.conf = new PageConf(_path, _name);
					this.getPageModules();
				}
				else this.pageState = false;
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
                          if(dArr[d].endsWith(wf.CONF['VIEW_END']))
                          {
                            var ind = dArr[d].replace(wf.CONF['VIEW_END'], "");
                            this.view[ind] = fs.readFileSync(v + dArr[d], 'utf8');
                          }
                    }
                }
            }

			this.getPageModules = function()
			{
				var mPath = this.path + this.conf.config['mod'];
				if(this.conf.config['mod'] !== undefined && fs.existsSync(mPath) && fs.lstatSync(mPath).isDirectory())
                {
					this.modules = getPageModulesArray(mPath, true);
                }
			}

			/* FONCTION DECLARATIONS */
			this.checkPage();
            this.conf = new PageConf(_path, _name);
            this.loadViews();
			/*************************/
}

function PageConf(_path, _name)
{
	this.path = _path + _name + "/";
    this.name = _name;
    this.config = { "state": true, "pos": 100, "cached": false, "view": "view", "uri": this.name, };

	this.readConf = function()
	{
		var file = this.path + this.name + wf.CONF['CONFIG_END'];
		if(fs.existsSync(file))
		{
			try
            {
              var pageConf = require (file);
              for(var prop in pageConf)
              {
                for(var index in pageConf[prop])
                {
                  this.config[index] = pageConf[prop][index];
                }
              }
            }
            catch(e)
            {
              console.log("[!] Error conf : " + file);
            }
		}
	}
    
	this.readCss = function()
	{
		var file = this.path + this.name + wf.CONF['CSS_END'];
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

	/* FONCTION DECLARATIONS */
	this.readConf();
	this.readCss();
	/*************************/

}

function getPageModulesArray(c, state)
{
	if(state === undefined) state = false;
	var mArr = [];
	if(fs.existsSync(c) && fs.lstatSync(c).isDirectory())
	{
		var dArr = fs.readdirSync(c);
		dArr.forEach(function(d)
		{
			if (fs.lstatSync(c + '/' + d).isDirectory())
			{
				var mod = new Module(c, d);
				if(mod.modState && state == false && mod.conf.config['state']) {  mArr.push(mod); }
				else if(mod.modState && state) {  mArr.push(mod); }
			}
		});
	}
	mArr.sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
	return mArr;
}

function addPage(req, res)
{
	if(!req.zone || !req.page) return;
  var page = req.HOST.ZONES[req.zone].PAGES[req.page];
  var exec = UTILS.Clone(page.exec)
  if(exec.code) exec.code(req, res);
}

function addCss(h, z, p)
{
	var c = wf.CONF['HOST_PATH'] + wf.HOSTS[h].name + "/" + wf.CONF['ZONE_FOLDER'] + z + '/' + wf.CONF['PAGE_FOLDER'] + p;

	if(fs.existsSync(c) && fs.lstatSync(c).isDirectory())
	{
		var page = new Page(c, p);
		if( page.pageState && page.conf.config['state'] && page.conf.config['css'] !== undefined )
		{
			var cArr = require(page.conf.config['css']);
			for(css in cArr)
			{
				if(cArr[css].code !== undefined) cArr[css].code();
			}
		}
		page.cssModules();
	}
}

function pageExists(p)
{
	var c = wf.CONF['MAIN_PATH'] + wf.CONF['CONTENT_FOLDER'] + wf.CONF['ZONE_FOLDER'] + wf.TPL.zone + '/' + wf.CONF['PAGE_FOLDER'] + p;
	if(fs.existsSync(c) && fs.lstatSync(c).isDirectory()) return true;
	else return false;
}

function LoadPages()
{
  for(var s in wf.SERVERS)
  {
    for(var h in wf.SERVERS[s].HOSTS)
    {
      for(var z in wf.SERVERS[s].HOSTS[h].ZONES)
      {
        var pDir = wf.CONF['SRV_PATH'] + s + "/" + wf.CONF['HOST_FOLDER'] + wf.SERVERS[s].HOSTS[h].name + "/" + wf.CONF['ZONE_FOLDER'] + wf.SERVERS[s].HOSTS[h].ZONES[z].name + '/'  + wf.CONF['PAGE_FOLDER'];

        if(fs.existsSync(pDir) && fs.lstatSync(pDir).isDirectory())
        {
          wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES = [];
          var pArr = fs.readdirSync(pDir);
          var pArrL = pArr.length;

          for(var p = 0; p < pArrL; p++)
          {
            var pTmp = new Page(pDir, pArr[p]);
            if(pTmp.pageState && pTmp.conf.config['state'])
            {
                var v = s;
                var w = h;
                var x = z;
                var y = p;
              var cTmp = require(pDir + pTmp.name + "/" + pTmp.name + wf.CONF['PAGE_END']);
              if(typeof cTmp == "function")  
              {
                  cTmp = new cTmp();
                  
                  //var eTmp = {};

                  /*
                  for( var c in cTmp)
                  {
                    let cc = c;
                    var fn = new cTmp[c]();
                    for(var f in cTmp[c])
                    {
                      let ff = f;
                      if(typeof(cTmp[cc][ff]) == "function")
                      {
                        cTmp[cc][ff].getView = function(view){console.log("ok")};
                        eTmp[ff] = cTmp[cc][ff];
                      }
                    }
                  }
                  */
                  wf.SERVERS[v].HOSTS[w].ZONES[x].PAGES[y] = {'path': pDir, 'name': pTmp.name, 'uri':pTmp.conf.config.uri, 'conf': pTmp.conf, 'exec': cTmp, 'view':pTmp.view };
              }
            }
          }

          wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES.sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});

          var result = wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES;
          wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES = {};

          var pL = result.length;
          for(var i = 0; i < pL; i++)
          {
             if(result[i] !== undefined)
             {
               wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES[result[i].uri] = result[i];
             }
          }
        }
       }
    }
  }
}

function CreatePage(p, n)
{
	var page = new Page(p, n);
	return page;
}

/******************************* PAGE UTILS ******************************/
UTILS.Load = function(req, res, v)
{
    var view = req.HOST.ZONES[req.zone].PAGES[req.page].view;
    if(view[v] !== undefined)
    {
      res.tpl.inner += view[v];
    }
}
UTILS.GetView = function(req, res, v)
{
    var view = req.HOST.ZONES[req.zone].PAGES[req.page].view;
    if(view[v] !== undefined)
    {
      return view[v];
    }
}
UTILS.End = function(req, res, v)
{
    if(req.HOST.ZONES[req.zone].PAGES[req.page].view[v] !== undefined)
    {
      res.end(req.HOST.ZONES[req.zone].PAGES[req.page].view[v]);
    }
    else res.end("Undefined view");
}
/****************************************************************************/