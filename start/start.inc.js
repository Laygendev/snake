	require('./load.start.js');

	var conf_file = __dirname + "/" + "conf.start.js";

	// CHECK CONF FILE EXISTS
	if(!fs.existsSync(conf_file))
	{
		console.log("Cannot find valid conf file");
		process.exit();
	}
	require(conf_file);

