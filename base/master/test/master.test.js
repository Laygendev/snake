var test;
WF().SERVERS = {};
WF().CLUSTERS = {};

// TEST cli.master.js
test = require('../cli.master.js');
for(var exp in test)
{
		for(var f in test[exp])
			test[exp][f]();
}

// TEST cluster.master.js
require('../cluster.master.js');

// TEST event.master.js
require('../event.master.js');

// TEST message.master.js
require('../message.master.js');

// TEST service.master.js
require('../service.master.js');

console.log('[+] MASTER TEST OK');