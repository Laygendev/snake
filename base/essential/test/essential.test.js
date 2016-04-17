var test;
WF().SERVERS = {};

// TEST app.essential.js
test = require('../app.essential.js');
for(var exp in test)
{
		test[exp]({loop:0,app:[{exec:{}}]});
}

// TEST event.essential.js
test = require('../event.essential.js');

// TEST host.essential.js
test = require('../host.essential.js');
for(var exp in test)
{
		test[exp]({host:[{}]});
		new test[exp]({host:[{}]});
}

// TEST mimeutil.essential.js
test = require('../mimeutil.essential.js');
test.mimeUtil.lookup('test.js');

// TEST mod.essential.js
test = require('../mod.essential.js');
for(var exp in test)
{
		new test[exp]({mod:[{}]});
}

// TEST page.essential.js
test = require('../page.essential.js');
for(var exp in test)
{
		new test[exp]({page:[{}]});
}

// TEST process.essential.js
test = require('../process.essential.js');
for(var exp in test)
{
		new test[exp]();
}

// TEST script.essential.js
test = require('../script.essential.js');
for(var exp in test)
{
		new test[exp]();
}

// TEST script.essential.js
test = require('../srv.essential.js');
for(var exp in test)
{
	if(typeof test[exp] == "function")
		test[exp]({app:[]});
}

// TEST zone.essential.js
test = require('../zone.essential.js');
for(var exp in test)
{
	new test[exp]([]);
}

console.log('[+] ESSENTIAL TEST OK');