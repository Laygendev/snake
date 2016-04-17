var http = require('http');
var url = require("url");
var fs = require('fs');
var c = require('../../config.json');

var server = http.createServer(function(req, res) {
  var page = url.parse(req.url).pathname;
  console.log( page );
  if(page == '/') {
    fs.readFile('../client/index.html', 'utf8', function(err, data) {
      if(err) {
        return console.log(err);
      }

      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(data);
      res.end();
    });
  }
  else {
    /** Lecture de toutes les ressources (js, css) dans le dossier client */
    var pageSplitted = page.split( '.' );

    fs.readFile( '../client/' + page, 'utf-8', function(err, data) {
      if(err) {
        return console.log(err);
      }

      res.writeHeader(200, {"Content-Type": "text/" + pageSplitted[pageSplitted.length - 1]});
      res.write(data);
      res.end();
    });
  }
});

var snakeServer = require('./snake-server')(server);

var ipAddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || c.ip;
var serverPort = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || c.port;
server.listen(serverPort);
