// web.js
var express = require("express");
var logfmt = require("logfmt");
var spawn = require('child_process').spawn;
var app = express();

app.use(logfmt.requestLogger());

spawn("casperjs", ["test", "spokanevalley/submit.js", "--actionid=13894", "--description=Here's a lengthy description!"], { stdio: "inherit" });

app.get('/', function(req, res) {
  res.send('Hello World!');
});



var port = Number(process.env.PORT);
app.listen(port, function() {
  console.log("Listening on " + port);
});