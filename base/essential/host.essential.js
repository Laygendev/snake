/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.LoadHosts = LoadHosts;
module.exports.CreateHost = Host;
module.exports.LoadAppArray = LoadAppArray;
var wf = WF();

function Host(_path, _name)
{
		this.path = _path + _name + "/";
		this.name = _name;

	this.checkHost = function()
	{
		var folder = this.path;

		if(fs.existsSync(folder) && fs.lstatSync(folder).isDirectory())
		{
			this.hostState = true;
			this.host = folder;
		}
		else this.hostState = false;
	}

	/* FONCTION DECLARATIONS */
	this.checkHost();
	this.conf = new HostConf(_path, _name);
    
	/*************************/
}

function HostConf(_path, _name)
{

		this.path = _path + _name + "/";
		this.name = _name;
    this.config = { "version": "", "state": true, "css": "", "tpl": "", 'app': {}, };

	this.readConf = function()
	{
		var file = this.path + this.name + wf.CONF['CONFIG_END'];
		if(fs.existsSync(file))
		{
		  try
			{
			  var hostConf = require (file);
					  for(var prop in hostConf)
					  {
						for(var index in hostConf[prop])
				{
				  this.config[index] = hostConf[prop][index];
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
		var file = this.path + wf.CONF['CSS_END'];
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

	/* FONCTION DECLARATIONS */
	this.readConf();
	this.readCss();
	/*************************/
}

function hookHostCss(name)
{
	var path = wf.CONF['HOST_PATH'] + name;
	if (fs.existsSync(path) && fs.lstatSync(path).isDirectory())
	{
		var host = new Host(path, name);
		if(host.conf.config['css'].length > 0 && fs.existsSync(host.conf.config['css']) && host.hostState && host.conf.config['state'])
		{
			var hostCss = require(host.conf.config['css']);
			for(var prop in hostCss)
			{
				hostCss[prop].path = host.path + name + '/';
				if(hostCss[prop].code !== undefined) hostCss[prop].code();
			}
		}
	}
}

function LoadHosts()
{

  for(var srv in wf.SERVERS)
  {
    wf.SERVERS[srv].HOSTS = {};
    wf.SERVERS[srv].HOSTMAP = {};
    var tmpMap = [];
    var hDir = wf.CONF['SRV_PATH'] + srv + "/" + wf.CONF['HOST_FOLDER'];

    if(fs.existsSync(hDir) && fs.lstatSync(hDir).isDirectory())
    {
      var hArr = fs.readdirSync(hDir);
      hArr.forEach(function(d)
      {
        var hTmp = new Host(hDir, d);
        if(hTmp.hostState && hTmp.conf.config['state'])
        {
            wf.SERVERS[srv].HOSTS[d] =
            {
              'id': d,
              'path': hDir,
              'host':hTmp.conf.config.host,
              'hostState': hTmp.hostState,
              'state': hTmp.conf.config['state'],
              'name': hTmp.name,
              'app': hTmp.conf.config.app,
              'default_zone': hTmp.conf.config.default_zone,
              'default_page': hTmp.conf.config.default_page,
              'default_url': hTmp.conf.config.default_url,
              'conf': hTmp.conf.config,
            };
            for(var i in hTmp.conf.config.host)
            {
                tmpMap.push({pos: hTmp.conf.config.pos, host:i, hostId: d});
            }
        }
      });
    }
      tmpMap.sort(function(a, b){return a.pos - b.pos;});
      var j = tmpMap.length;
      for(var i = 0; i < j; i++)
      {
          wf.SERVERS[srv].HOSTMAP[tmpMap[i].host] = tmpMap[i].hostId;
      }
  }
}

function LoadAppArray()
{
	for(var s in wf.SERVERS)
	{
		for(var h in wf.SERVERS[s].HOSTS)
		{
            // LOAD APP IN AN ARRAY FOR A HOST
            wf.SERVERS[s].HOSTS[h].appArray = [];
            var map = wf.SERVERS[s].map;
            if(!map) loadNoMap(s, h);
            else loadWithMap(s, h, map);
        }
	}
}

function loadNoMap(s, h)
{
    if(wf.SERVERS[s] !== undefined && wf.SERVERS[s].engineArray !== undefined)
    {
        var et  = wf.SERVERS[s].engineArray.length;
        for(var tt = 0; tt < et; tt++)
        {
            if(wf.SERVERS[s].engineArray[tt].exec.runOnce && process.env.wrkId && process.env.wrkId == 0)
                wf.SERVERS[s].engineArray[tt].exec.runOnce();
            wf.SERVERS[s].HOSTS[h].appArray.push(wf.SERVERS[s].engineArray[tt]);
        }
    }
    for(var a in wf.SERVERS[s].HOSTS[h].app)
    {
        var tmp = [];
        // LOAD APPS
        if(wf.SERVERS[s].APPS !== undefined && wf.SERVERS[s].APPS[a] !== undefined)
        {
          var pmax = wf.SERVERS[s].APPS[a].length;
          for(var p = 0; p < pmax; p++)
          {
            if(wf.SERVERS[s].APPS[a][p] !== undefined)
            {
              tmp.push(wf.SERVERS[s].APPS[a][p]);
            }
          }
          // LOAD HOOKS AT THE RIGHT PLACE
          if(wf.SERVERS[s].HOSTS[h].HOOKS !== undefined && wf.SERVERS[s].HOSTS[h].HOOKS[a] !== undefined)
          {
            var m = wf.SERVERS[s].HOSTS[h].HOOKS[a].length;
            for(var o = 0; o < m; o++)
            {
              tmp.push(wf.SERVERS[s].HOSTS[h].HOOKS[a][o]);
            }
          }

          tmp.sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
          var tmpl = tmp.length;
          for(var tt = 0; tt < tmpl; tt++)
          {
              if(tmp[tt].exec.runOnce && process.env.wrkId && process.env.wrkId == 0)
                tmp[tt].exec.runOnce();
              wf.SERVERS[s].HOSTS[h].appArray.push(tmp[tt]);
          }
        }
    }
}

function loadWithMap(s, h, map)
{
    var aMap = [];
    var iMap = {};
    var mL = map.length;
    for(var i = 0; i < mL; i++)
    {
        iMap[map[i]]  = i;
        aMap.push([]);
    }
    
    if(!iMap["app"])
    {
        iMap["app"] = mL;
        aMap.push([]);
    }

    if(wf.SERVERS[s] !== undefined && wf.SERVERS[s].engineArray !== undefined)
    {
        var et  = wf.SERVERS[s].engineArray.length;
        for(var tt = 0; tt < et; tt++)
        {
            if(wf.SERVERS[s].engineArray[tt].init && wf.SERVERS[s].engineArray[tt].init.at)
            {
                aMap[iMap[wf.SERVERS[s].engineArray[tt].init.at]].push(wf.SERVERS[s].engineArray[tt]);
            }
        }
    }
    
    for(var a in wf.SERVERS[s].HOSTS[h].app)
    {
        // LOAD APPS
        if(wf.SERVERS[s].APPS !== undefined && wf.SERVERS[s].APPS[a] !== undefined)
        {
          var pmax = wf.SERVERS[s].APPS[a].length;
          for(var p = 0; p < pmax; p++)
          {
            if(wf.SERVERS[s].APPS[a][p] !== undefined)
            {
              aMap[iMap["app"]].push(wf.SERVERS[s].APPS[a][p])
            }
          }
          // LOAD HOOKS AT THE RIGHT PLACE
          if(wf.SERVERS[s].HOSTS[h].HOOKS !== undefined && wf.SERVERS[s].HOSTS[h].HOOKS[a] !== undefined)
          {
            var m = wf.SERVERS[s].HOSTS[h].HOOKS[a].length;
            for(var o = 0; o < m; o++)
            {
                aMap[iMap["app"]].push(wf.SERVERS[s].HOSTS[h].HOOKS[a][o]);
            }
          }

          aMap[iMap["app"]].sort(function(a, b){return a.conf.config['pos'] - b.conf.config['pos'];});
        }
    }
    
    for(var m in iMap)
    {
        var l = aMap[iMap[m]].length;
        for(var i = 0; i < l; i++)
        {
            if(aMap[iMap[m]][i].exec.runOnce && process.env.wrkId && process.env.wrkId == 0)
                aMap[iMap[m]][i].exec.runOnce();
            wf.SERVERS[s].HOSTS[h].appArray.push(aMap[iMap[m]][i]);
        }
    }
}
