
### What is csp-validator?

`csp-validator.js` is a phantomjs based headless script to test CSP policy for the given URL. You may use this script during the web application build process (integration testing phase) to validate CSP policy to make sure your web page complies with the defined policy. 

Using the script as part of the the build process helps the team to detect inclusion of non-whitelisted resources before the application deploys to production. For example, adding a third-party Javascript tag or adding a HTTP resource to an HTTPS page.

NOTE: `csp-validator.js` is an independent tool with no dependency on `csptester`.
### Usage

Prerequisite: <a href="http://phantomjs.org/" target="_blank">phantomjs</a> 

```
% bin/phantomjs csp-validator.js 

Usage: csp-validator.js [--quiet] <URL>
Returns:
 0 => SUCCESS - No violations
 1 => FAIL - System/parse/input error
 2 => CSP-VIOLATION - Violation detected

```

Want to do a quick try?

1. Go to <a href="http://csptester.io/csptest.html" target="_blank">http://csptester.io/csptest.html</a> 
2. Opt 'Render on `top.window`' and click `Submit`
3. Click `View Violations`. This will open a new window/tab. Go back to previous tab, copy the URL and use it here

**Example**
```
% bin/phantomjs csp-validator.js http://74.6.34.39/test/w1uCH63aAg6Gv3IE
http://74.6.34.39/report/w1uCH63aAg6Gv3IE
Request (#2): {"csp-report":{"document-uri":"http://74.6.34.39/test/w1uCH63aAg6Gv3IE","referrer":"","violated-directive":"default-src none","original-policy":"default-src none; report-uri /report/w1uCH63aAg6Gv3IE;","blocked-uri":"http://yui.yahooapis.com"}}
http://74.6.34.39/report/w1uCH63aAg6Gv3IE
Request (#3): {"csp-report":{"document-uri":"http://74.6.34.39/test/w1uCH63aAg6Gv3IE","referrer":"","violated-directive":"default-src none","original-policy":"default-src none; report-uri /report/w1uCH63aAg6Gv3IE;","blocked-uri":"https://ajax.googleapis.com"}}
http://74.6.34.39/report/w1uCH63aAg6Gv3IE
Request (#4): {"csp-report":{"document-uri":"http://74.6.34.39/test/w1uCH63aAg6Gv3IE","referrer":"","violated-directive":"default-src none","original-policy":"default-src none; report-uri /report/w1uCH63aAg6Gv3IE;","blocked-uri":"http://l.yimg.com"}}

Status:  success
Loaded:  http://74.6.34.39/test/w1uCH63aAg6Gv3IE
Number of violations: 3

% echo $?
2

```
