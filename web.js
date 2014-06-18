var express = require("express");
var bodyParser = require('body-parser')
var logfmt = require("logfmt");
var request = require("request");
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
      
      var tracking_number = data.substr(17, data.length - 18);
      console.log("Tracking Number: " + tracking_number);
      res.json(201, { tracking_number: tracking_number });
      
    } else if (data.search("Error:") === 0) {
      
      var response = data.substr(7, data.length - 8);
      res.json(202, { error: response });
      var error = new Error(response);
      console.log(error.stack)
      
    };
    
  });
  
};

function spokanevalley_status(tracking_number, res) {
  
  console.log("Tracking Number: " + tracking_number);
  
  request.post(
    'http://www.egovlink.com/spokanevalley/action_request_lookup.asp',
    { form: { REQUEST_ID: tracking_number } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
          
          var start = body.search('C.A.R.E.S. Activity') + 29;
          var end = body.search('http://www.egovlink.com/spokanevalley/img/clearshim.gif');
          
          if (start === 28) {
            start = body.search('C.A.R.E.S. Lookup') + 24;
            end = end - 42;
          } else {
            end = end - 84;
          }
          
          var status = body.substr(start, end - start);
          console.log(status);
          
          res.json(200, { status: status });
        }
    }
  );
  
};

app.post('/new', bodyParser(), function(req, res) {
  var actionid = req.body.actionid;
  var desc = req.body.desc;
  if (actionid === undefined || desc === undefined) {
    res.json(202, { error: "ActionID and Description are required!" });
  }
  var tracking_number = spokanevalley_submit(actionid, desc, res);
});

app.post('/status', bodyParser(), function(req, res) {
  var tracking_number = req.body.tracking_number;
  if (tracking_number === undefined) {
    res.json(202, { error: "tracking_number is required!" });
  }
  var status = spokanevalley_status(tracking_number, res);
});

app.get('/', function(req, res) {
  res.send(404, 'Oops, nothing here!');
});

var port = Number(process.env.PORT);
app.listen(port, function() {
  console.log("Listening on " + port);
});