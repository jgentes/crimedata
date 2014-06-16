var express = require("express");
var bodyParser = require('body-parser')
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
    //console.log(data); //REQUIRED FOR DEBUGGING CASPER - uncomment to see casper data log
    if (data.search("Tracking Number:") === 0) {
      
      var tracking_number = data.substr(17, data.length - 17);
      console.log("Tracking Number: " + tracking_number);
      res.send(201, 'Tracking Number: ' + tracking_number);
      
    } else if (data.search("Error:") === 0) {
      
      var response = data.substr(7, data.length - 7);
      res.send(202, 'Error: ' + response);
      var error = new Error(response);
      console.log(error.stack)
      
    };
    
  });
  
};

function spokanevalley_status(tracking_number, res) {
  
  console.log("Tracking Number: " + tracking_number);
  
  var child = spawn("casperjs", ["test", "spokanevalley/submit.js", "--actionid=" + actionid, "--desc=" + desc]);
  
  child.stdout.on('data', function (data) {
    data = data.toString();
    //console.log(data); //REQUIRED FOR DEBUGGING CASPER - uncomment to see casper data log
    if (data.search("Tracking Number:") === 0) {
      
      var tracking_number = data.substr(17, data.length - 17);
      console.log("Tracking Number: " + tracking_number);
      res.send(201, 'Tracking Number: ' + tracking_number);
      
    } else if (data.search("Error:") === 0) {
      
      var response = data.substr(7, data.length - 7);
      res.send(202, 'Error: ' + response);
      var error = new Error(response);
      console.log(error.stack)
      
    };
    
  });
  
};

app.post('/new', bodyParser(), function(req, res) {
  var actionid = req.body.actionid;
  var desc = req.body.desc;
  if (actionid === undefined || desc === undefined) {
    res.send(202, 'Error: ActionID and Description are required!');
  }
  var tracking_number = spokanevalley_submit(actionid, desc, res);
});

app.post('/response', bodyParser(), function(req, res) {
  var tracking_number = req.body.tracking_number;
  var status = spokanevalley_status(tracking_number, res);
});

app.get('/', function(req, res) {
  res.send(404, 'Oops, nothing here!');
});

var port = Number(process.env.PORT);
app.listen(port, function() {
  console.log("Listening on " + port);
});