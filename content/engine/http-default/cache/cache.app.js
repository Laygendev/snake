/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.cacheApp = new cacheApp();
function cacheApp()
{
    var wf = WF();
    this.runOnce = function()
    {
        function doCache()
        {
            if(wf.CONF['SHARED_CACHE'] && wf.CONF['REFRESH_CACHE'])
            {
                setInterval(getCache, wf.CONF['INTERVAL_CACHE']);
            }
        }
        
        function getCache()
        {
            for(var s in wf.SERVERS)
            {
                if(wf.SERVERS[s].HOSTS !== undefined)
                {
                    for(var h in wf.SERVERS[s].HOSTS)
                    {
                        if(wf.SERVERS[s].HOSTS[h].ZONES !== undefined)
                        {
                            for(var z in wf.SERVERS[s].HOSTS[h].ZONES)
                            {
                                if(wf.SERVERS[s].HOSTS[h].ZONES[z].conf.shared !== undefined && wf.SERVERS[s].HOSTS[h].ZONES[z].conf.cache !== undefined)
                                {
                                    for(var f in wf.SERVERS[s].HOSTS[h].ZONES[z].shared)
                                    {
                                        var tmp = wf.SERVERS[s].HOSTS[h].ZONES[z].shared[f];
                                        fs.stat( tmp.path, function(err, stat)
                                        {
                                            if(err || !stat.isFile())
                                            {
                                                delete wf.SERVERS[s].HOSTS[h].ZONES[z].shared[f];
                                            }
                                            
                                            else if( tmp.mtime != stat.mtime 
                                                && UTILS.checkCache(wf.SERVERS[s].HOSTS[h].ZONES[z].conf.cache, tmp.path) )
                                            {
                                                try{
                                                var toAdd = {};
                                                toAdd.buffer = fs.readFileSync(tmp.path);
                                                toAdd.mime = wf.mimeUtil.lookup(tmp.path);
                                                toAdd.path = tmp.path;
                                                toAdd.mtime = stat.mtime;
                                                wf.SERVERS[s].HOSTS[h].ZONES[z].shared[f] = toAdd;
                                                }catch(e){};
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }        
        
        wf.eventEmitter.on("run", doCache);
    }
}