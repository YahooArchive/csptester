//
// Copyright (c) 2015, Yahoo Inc.
// Copyrights licensed under the New BSD License. See the
// accompanying LICENSE.txt file for terms.
// 
//   Author: Binu P. Ramakrishnan
//   Created: 03/06/2015
//
// A phantomjs headless script to test CSP policy of the given URL
// use as part of CICD pipeline
//
// Usage: % phantonjs csp-validator.js <URL>
//

var system = require('system');
var args = system.args;

var homePage;
var quiet=false;
var violationCount=0;

if (args.length < 2) {
  console.log('\nUsage: ' + args[0] + ' [--quiet] <URL>');
  console.log('Returns:');
  console.log(' 0 => SUCCESS - No violations');
  console.log(' 1 => FAIL - System/parse/input error');
  console.log(' 2 => CSP-VIOLATION - Violation detected\n');
  phantom.exit(1);
} else {
  homePage = args[args.length-1];
  if ((args.length === 3) && (args[1] == '--quiet')) {
    quiet=true;
  }
}

var page = require("webpage").create();

/*page.customHeaders = {
  "Cookie": "auth cookies"
};
*/

page.open(homePage);

page.onLoadFinished = function(status) {
  if (status !== 'success') {
    console.log('URL load failed; exiting...');
    phantom.exit(1);
  }

  var url = page.url;
  if (quiet === false) {
    console.log('Status:  ' + status);
    console.log('Loaded:  ' + url);
  }

  console.log('Number of violations: ' + violationCount);
  if (violationCount > 0) {
    phantom.exit(2);
  } else {
    phantom.exit(0);
  }
};

// filter csp reports
page.onResourceRequested = function(requestData, networkRequest) {
  console.log(requestData.url); 
  //console.log('Request (#' + requestData + ': ' + JSON.stringify(requestData)); 
  if (requestData.postData) {
    try{
      if (JSON.parse(requestData.postData)['csp-report']) {
        if (quiet == false) {
          console.log('Request (#' + requestData.id + '): ' + requestData.postData); 
        }
      }

      violationCount++;
    }catch(e){
        //alert(e); //error in the above parsing; skip and continue
        
    }
  }
};
