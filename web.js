var express = require("express");
var bodyParser = require('body-parser');
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
      res.json(422, { error: response });
      var error = new Error(response);
      console.log(error.stack);
      
    }
    
  });
  
}

function spokanevalley_update(tracking_number, desc, res) {
  
  console.log("Tracking Number: " + tracking_number);
  console.log("Description: " + desc);
  
  var child = spawn("casperjs", ["test", "spokanevalley/update.js", "--desc=" + desc, "--tracking_number=" + tracking_number]);
  
  child.stdout.on('data', function (data) {
    data = data.toString();
    //console.log(data); //REQUIRED FOR DEBUGGING CASPER - uncomment to see casper data log
    if (data.search("Tracking Number:") === 0) {
      
      var tracking_number = data.substr(17, data.length - 18);
      console.log("Tracking Number: " + tracking_number);
      res.json(201, { tracking_number: tracking_number });
      
    } else if (data.search("Error:") === 0) {
      
      var response = data.substr(7, data.length - 8);
      res.json(422, { error: response });
      var error = new Error(response);
      console.log(error.stack);
      
    }
    
  });
  
}

function spokanevalley_status(tracking_number, res) {
  
  console.log("Tracking Number: " + tracking_number);
  
  request.post(
    'http://www.egovlink.com/spokanevalley/action_request_lookup.asp',
    { form: { REQUEST_ID: tracking_number } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var results = [];
          var id = 0;
          var jsdom = require("jsdom");
          
          jsdom.env(body, ["http://code.jquery.com/jquery.js"],
          function (errors, window) {
            
            var comments = window.$(window.$("div:contains('Status  - Date of Activity') ~ div").get().reverse()).each(function () {
              var comment = window.$(this).text();
              if (id % 2 == 1) {
                var start = comment.search(' - ');
                var status = comment.substr(0, start);
                var date = comment.substr(start + 3, comment.length - start);
                var userbracket = window.$(this).next('div').children('strong').text();
                var user = userbracket.substr(1, userbracket.length - 4);
                var message = window.$(this).next('div').children('em').text();
                results.push({id: tracking_number + 'x' + id, date: date, status: status, user: user, message: message});
                console.log("results: " + JSON.stringify(results));
              }
              id++;
            });
            res.json(200, results);
          });
        } else { return error; }
    }
  );
  
}

app.post('/new', bodyParser(), function(req, res) {
  var actionid = req.body.actionid;
  var desc = req.body.desc;
  if (actionid === undefined || desc === undefined) {
    res.json(422, { error: "ActionID and Description are required!" });
  } else {
    spokanevalley_submit(actionid, desc, res);
  }
});

app.get('/status/:tracking_number', function(req, res) {
  var tracking_number = req.params.tracking_number;
  if (tracking_number === undefined) {
    res.json(422, { error: "tracking_number is required!" });
  } else {
    spokanevalley_status(tracking_number, res);
  }
});

app.put('/update', bodyParser(), function(req, res) {
  var tracking_number = req.body.tracking_number;
  var desc = req.body.desc;
  if (tracking_number === undefined || desc === undefined) {
    res.json(422, { error: "tracking_number and description (desc) are required!" });
  } else {
    spokanevalley_update(tracking_number, desc, res);
  }
});

app.get('/', function(req, res) {
  res.send(404, 'Oops, nothing here!');
});

var port = Number(process.env.PORT);
app.listen(port, function() {
  console.log("Listening on " + port);
});