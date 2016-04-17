
var conf =
	{
		'state': false,
		'pos': 10, // process launching order
		'restart': 'auto', // none,
		'attempt': 0, // 0 = infinite, 1 = 1 attempt, undefined = none
		'delay': 5000, // MILLISECOND
		'cmd': "node", // process to exec
		'args': [__dirname + "/lib/process.js"], // array with args
		'log': 'all', // error, info, all,
		'option':
		{
			// OPTION CHILD.SPAWN
			'cwd': __dirname,
		}
	}

	module.exports.listenConf = conf;
