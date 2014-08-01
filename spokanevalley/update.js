var x = require('casper').selectXPath;
//require("utils").dump(casper.cli.options); // useful for seeing what command line arguments are passed in
casper.options.viewportSize = {width: 1920, height: 1075};
casper.on('page.error', function(msg, trace) {
   console.log('Error: ' + msg, 'ERROR'); // REQUIRED for parsing errors properly
   for(var i=0; i<trace.length; i++) {
       var step = trace[i];
       this.echo('   ' + step.file + ' (line ' + step.line + ')', 'ERROR');
   }
});
casper.test.begin('Update existing request on Spokane Valley e-Gov', function(test) {
   var tracking_number = casper.cli.options.tracking_number;
   var desc = casper.cli.options.desc;
   
   casper.start();
   
   casper.open('http://www.egovlink.com/spokanevalley/action_request_lookup.asp', {
    method: 'post',
    data:   {
        'REQUEST_ID': tracking_number,
    },
    headers: {
        'Content-type': 'application/x-www-form-urlencoded'
    }
   });

   casper.waitForSelector("textarea[name='sMsg']",
       function() {
           this.sendKeys("textarea[name='sMsg']", desc);
   });
   casper.waitForSelector("form[name=frmPost] input[type=button][value='POST MESSAGE']",
       function() {
           this.click("form[name=frmPost] input[type=button][value='POST MESSAGE']");
           console.log("Tracking Number: " + tracking_number);
   });

   casper.run();
});