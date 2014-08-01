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
casper.test.begin('Submit request to Spokane Valley e-Gov', function(test) {
   var actionid = casper.cli.options.actionid;
   var desc = toString(casper.cli.options.desc);
   var tracking_number = '';
   
   casper.start('http://www.egovlink.com/spokanevalley/action.asp?actionid=' + actionid);
   casper.waitForSelector("#fmquestion1",
       function() {
           this.click("#fmquestion1");
       });
   casper.waitForSelector("textarea[name='fmquestion1']",
       function() {
           this.sendKeys("textarea[name='fmquestion1']", desc);
       });
   casper.waitForSelector("form[name=frmRequestAction] input[name='chkSendEmail']",
       function() {
           this.click("form[name=frmRequestAction] input[name='chkSendEmail']");
       });
   casper.waitForSelector("form[name=frmRequestAction] input[type=button][value='SEND REQUEST']",
       function() {
           this.click("form[name=frmRequestAction] input[type=button][value='SEND REQUEST']");
       });
   casper.then(function() {
       this.wait(3000, function() {
           tracking_number = this.fetchText('.groupSmall p b');
           //tracking_number = 7474491301;
           if (tracking_number == '') {
               tracking_number = 'None!';
           };
           console.log("Tracking Number: " + tracking_number); //REQUIRED for parsing output
       });
   });

   casper.run();
});