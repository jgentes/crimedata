var x = require('casper').selectXPath;
//require("utils").dump(casper.cli.options);
casper.options.viewportSize = {width: 1920, height: 1075};
casper.on('page.error', function(msg, trace) {
   this.echo('Error: ' + msg, 'ERROR');
   for(var i=0; i<trace.length; i++) {
       var step = trace[i];
       this.echo('   ' + step.file + ' (line ' + step.line + ')', 'ERROR');
   }
});
casper.test.begin('Submit request to Spokane Valley e-Gov', function(test) {
   var actionid = casper.cli.options.actionid;
   var desc = toString(casper.cli.options.desc);
   
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
           //this.click("form[name=frmRequestAction] input[type=button][value='SEND REQUEST']");
       });
   casper.then(function() {
       this.wait(1000, function() {
           //test.assertTitle('E-Gov Services City of Spokane Valley');
           //tracking_number = this.fetchText('.groupSmall p b');
           tracking_number = 5000;
           console.log ("Tracking Number: " + tracking_number)
       });
   });

   casper.run();
});