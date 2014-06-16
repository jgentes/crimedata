var express = require("express");
var logfmt = require("logfmt");
var spawn = require('child_process').spawn;
var app = express();

app.use(logfmt.requestLogger());

function spokanevalley_submit(actionid, desc, res) {
  
  console.log("Action ID: " + actionid);
  console.log("Description: " + desc);
  
  var child = spawn("casperjs", ["test", "spokanevalley/submit.js", "--actionid=" + actionid, "--desc=" + desc]);
  
  child.stdout.on('data', function (data) {
    data = data.toString();
    //console.log(data); #uncomment to see casper data log
    if (data.search("Tracking Number:") === 0) {
      var tracking_number = data.substr(17, data.length - 17);
      console.log("Tracking Number: " + tracking_number);
      res.send('Tracking Number: ' + tracking_number);
    };
    
    //child.on('exit', function() { #useful for identifying the end of the process
    //  console.log('FINISHED!');
      //process.exit();
    //});
  
  });
  
};

app.get('/new', function(req, res) {
  var actionid = req.query.actionid;
  var desc = req.query.desc;
  var tracking_number = spokanevalley_submit(actionid, desc, res);
  //res.send('Tracking Number: ' + tracking_number);
});

var port = Number(process.env.PORT);
app.listen(port, function() {
  console.log("Listening on " + port);
});