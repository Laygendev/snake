var srvConf=
{
    "state": true, // true | false
    "type": "http", // "http", "net", ... see base/server/
    "name": "Default name", // "my name"
    "port": {"http": 8080}, // { "http": 80, "http2":81 }
    "thread": 1, // int or os.cpus().length
    "engine": 
    {
      "http-default": {},
    } // { "http-data": {}, "http-route": {}}
}
module.exports.srvConf = srvConf;