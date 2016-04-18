var sioConf=
	{
		"state": true,
		"type": "socketio",
		"name": "socketio webserver",
		"port": {"http": 3001 },
		"thread": 1,//os.cpus().length,
		"engine":
		{
		  "socketio-start": {at: "start"},
		  "http-start": {at: "start"},
		  "http-data": {at: "start"},
		  "http-zone": {at: "start"},
		  "http-page": {at: "start"},
		  "http-default": { at: "default"},
		  "http-route": {at: "route"},
		  "http-error": {at: "error"}
		},
		"map": ["start", "app", "default", "route", "error" ], // Order app/engine launching map
	}
module.exports.sioConf = sioConf
