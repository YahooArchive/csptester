## CSPTESTER

A quick and easy way to test CSP behavior on modern browsers

`csptester` is a Node.js-based web app that can frame a user's HTML content and allow them to test CSP policies in a browser of their choice to see what fails/works. You may optionally even try XSS attacks against your code. There are tools like <a href="http://caniuse.com/#search=csp" target="_blank">http://caniuse.com/#search=csp</a> that shows which browser versions support CSP, but it doesn't convey disparity in support between versions or browsers. And that's one reason `csptester` is helpful.

**Features**
 * Test CSP on all modern browsers
 * CSP HTML meta tag support
 * Ability to render your HTML code on iframe and top-level window
 * Report-only and enforce mode options. Try an `alert()` in your code to see report-only and enforce in action!
 * Shareable links - To share with other users or to repeat the test on a different browser
 * Preloaded with curated subset of WebKit/Chrome tests (CSP level 1 & 2) to test various CSP features
 * Check 3rd party resources (eg. JavaScript) to find 4th party/recursive dependencies

## Using csptester

CSP implementation differs between browsers. Even CSP 1.0 implementation is not consistent across all modern browsers. Therefore understanding browser's CSP support is important to implement CSP on your property.  This is a tool to test policy behavior (with your sample script) across multiple browsers. However this is NOT intended to use to test a random site's CSP behavior.

### CSP Header
The Content-Security-Policy (CSP) header value is made up of one or more directives.  Multiple directives are separated with a semicolon (`;`)

**NOTE:** Do not add CSP header name and report-uri field. The header and report-uri will be set by the application.

**CSP header examples**

[1] A server wishes to load resources only form its own origin
```
default-src 'self';
```

[2]  This policy allows images, scripts, AJAX, and CSS from the same origin, and does not allow any other resources to load (eg object, frame, media, etc).
```
default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self';
```

[3] Allow all by default and restricts each resource type separately.
```
default-src *;
script-src https://*.yahoo.com https://*.yimg.com 'unsafe-inline' 'unsafe-eval'; 
object-src https://*.yahoo.com https://*.yimg.com; 
style-src https://*.yahoo.com https://*.yimg.com 'unsafe-inline'; 
media-src https://*.yahoo.com https://*.yimg.com; 
frame-src https://*.yahoo.com https://*.yimg.com https://*.ymail.com; 
font-src https://*; 
connect-src https://*.yahoo.com https://*.flickr.com  
```

### HTML Code 
Provide your HTML code here. 

**Example**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>CSP Tester</title>

    <link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/pure-min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    
  </head>
  <body>
    <h1>Hello, world!</h1>

    <img src="http://l.yimg.com/a/i/us/nws/weather/gr/30d.png"> </img>
  </body>
</html>
```

If we set  CSP header `default-src 'self'`, the above HTML code reports four violations.

### Report Only - CSP in monitoring mode
Disable policy enforcement. This will render the page even with the violations. The number of CSP reports tend to increase with this option set. That is because a violated resource may embed other violated URIs - chain effect.

### CSP HTML meta tags
`csptester` also supports testing CSP with HTML `meta` tag. `meta` tag is another way to set content security policy on a web page. To track violations with CSP meta tag on `csptester` tool, provide a URL variable called $CSP_REPORT_URI for `report-uri` field as shown below:

```html
<meta http-equiv="content-security-policy" content="default-src none; report-uri $CSP_REPORT_URI;"/>
```

**Example**

The policy is set in the HTML code using `meta` tag. This is equivalent to setting an explicit CSP header. Setting a CSP header is optional in this case.
 
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>CSP Tester</title>

    <meta http-equiv="content-security-policy" content="default-src none; report-uri $CSP_REPORT_URI;"/>

    <link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/pure-min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>

  </head>
  <body>
    <h1>Hello, world!</h1>

    <img src="http://l.yimg.com/a/i/us/nws/weather/gr/30d.png"> </img>
  </body>
</html>
```

### Render on window.top
`csptester` provides two options to render HTML code; (1) iframe (2) top-level window. iframe is the default option. The second option opens two new windows (or tabs). The first window renders HTML code and the other one shows violation reports. The second option is useful in the following cases:
 * Policy enforcement varies and the result wont be exactly same on iframe and top-level window.
 * If you copy paste a web page (eg yahoo mail page source), those web pages may have (javascript) checks to test the rendering window is an iframe or not, and may not even render on iframe.
 * Many browser plugins (adwares, malwares etc.) inject code only to top window pages. So we cannot detect such violations with iframe option.
 * Shareable links are supported only in this mode

### WebKit CSP Tests
`csptester` is preloaded with curated subset of WebKit CSP tests to test various CSP features. Not all WebKit tests are available now in csptester. These scripts cover most common CSP user cases and serve as an excellent learning resource.

All tests are adopted from [WebKit](https://trac.webkit.org/browser#trunk/LayoutTests/http/tests/security/contentSecurityPolicy/) and [Chrome](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/LayoutTests/http/tests/security/contentSecurityPolicy/1.1/&sq=package:chromium) repositories

## Deploying csptester

 1. Clone or download [csptester](https://github.com/yahoo/csptester) from git
 2. Install npm packages: `% cd csptester && npm install`
 3. Install [redis](http://redis.io/)
 4. Start redis: `% redis-server /usr/local/etc/redis.conf`
 5. `% node ./bin/www` 

For service management, use [forever](https://www.npmjs.com/package/forever) npm package

### Settings

Application settings such as TLS, redis connection, default port are defined in `config.js` file. 

### Known Issues

 1. WebKit & Chrome CSP tests use HTML meta-tags to define policy. Since CSP meta-tag option is not implemented in Firefox, these tests may not work in Firefox. The workaroud is to take the CSP policy defined in the HTML meta-tag and put it in CSP header field.
 2. If you are not seeing the desired behavior for CSP Level 2 tests with default option (iframe), try with enabling top-level window option.

### [csp-validator.js](https://github.com/yahoo/csptester/blob/master/csp-validator/csp-validator.js)
`csp-validator.js` is a separate phantomjs based command-line script to validate CSP policy for the given URL. You may use this script during the web application build process (integration testing phase) to validate CSP policy to make sure your web page complies with the defined policy. Click [csp-validator](https://github.com/yahoo/csptester/blob/master/csp-validator/README.md) to find more details.
