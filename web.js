var express = require("express");
var logfmt = require("logfmt");
var spawn = require('child_process').spawn;
var app = express();

app.use(logfmt.requestLogger());

function spokanevalley_submit(actionid, desc) {
  
  actionid = "--actionid=" + 13894;
  desc = "--desc=" + "Here's a lengthy description!";
  
  var child = spawn("casperjs", ["test", "spokanevalley/submit.js", actionid, desc]);
  
  child.stdout.on('data', function (data) {
    data = data.toString();
    //console.log('stdout:' + data);
    if (data.search("Tracking Number:") === 0) {
      var tracking_number = data.substr(17, data.length - 17);
      console.log("Tracking Number: " + tracking_number);
    };
  });
  
  child.on('exit', function() {
    console.log('FINISHED!');
    process.exit()
  });
  
};

spokanevalley_submit();

app.get('/', function(req, res) {
  res.send('Hello World!');
});



var port = Number(process.env.PORT);
app.listen(port, function() {
  console.log("Listening on " + port);
});