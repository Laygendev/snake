/*

Copyright (C) 2016  Adrien THIERRY
http://seraum.com 

*/
module.exports.pageEngine = new pageEngine();

function pageEngine()
{
    var wf = WF();
    for(var s in wf.SERVERS)
    {
        for(var h in wf.SERVERS[s].HOSTS)
        {
            for(var z in wf.SERVERS[s].HOSTS[h].ZONES)
            {
				var path = "/";
				if(wf.SERVERS[s].HOSTS[h].default_zone && wf.SERVERS[s].HOSTS[h].default_zone != z)
				{
					path += z + "/";
				}
                for(var p in wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES)
                {
                    if(wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES[p].exec && wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES[p].exec.code)
                    {       
                        var context = wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES[p];
                        if(wf.SERVERS[s].HOSTS[h].default_page && wf.SERVERS[s].HOSTS[h].default_page == p)
                        {
							
                            for(var u in wf.SERVERS[s].HOSTS[h].host)
                            {
                                wf.Router.ANY(u, path, wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES[p].exec.code.bind(context));
                            }
                        }
                        else
                        {
                            for(var u in wf.SERVERS[s].HOSTS[h].host)
                            {
                                wf.Router.ANY(u, path + p, wf.SERVERS[s].HOSTS[h].ZONES[z].PAGES[p].exec.code.bind(context));
                            }
                        }
                    }
                }
            }
        }
    }
}