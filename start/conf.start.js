var wf = WF();

if(cluster.isMaster)
{
    
  // MASTER STATIC LOAD ORDER
  // CHANGE ONLY IF YOU KNOW WHAT YOU DO
  wf.Load.Base("conf", wf.CONF['MAIN_PATH']);
  wf.Load.Base("proto");
  wf.Load.Base("essential");
  wf.Load.Base("core");
  wf.Load.Base("util");
  wf.Load.Base("layer");
  wf.Load.Base("model");
  wf.Load.Base("master");

  // LOG ERRORS BUT DON'T STOP THREAD
  process.on('uncaughtException', function (err) { "uncaughtExceptions => " + wf.Log(err); });
  // LOAD MASTER SERVICES
  wf.Service.Start();

}
else
{
	// SLAVE STATIC LOAD ORDER
	// CHANGE ONLY IF YOU KNOW WHAT YOU DO
	wf.Load.Base("conf", wf.CONF['MAIN_PATH']);
	wf.Load.Base("proto");
	wf.Load.Base("essential");
	wf.Load.Base("core");
	wf.Load.Base("util");
    wf.Load.Base("server");
	wf.Load.Base("layer");
	wf.Load.Base("model");
    //wf.Load.Base("trading");
	wf.Load.Base("worker");

    // LOG ERRORS BUT DON'T STOP THREAD
    process.on('uncaughtException', function (err) { "uncaughtExceptions => " + wf.Log(err); });
	// START SERVICES
	wf.Service.loadAll();

}

