// Copyright (c) 2015, Yahoo Inc.
// Copyrights licensed under the New BSD License. See the
// accompanying LICENSE.txt file for terms.
//
//   Author Binu P. Ramakrishnan
//   Created 01/05/2015

var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var randomstring = require("randomstring");
var redis = require('redis');
var hostname = require('os').hostname();

// config details; not the best, but works!
var config = require('../config.js');
var title = config.title;
var expiry = config.ephemeralCache;
var linkexpiry_ms = config.longLivedCache;
var keylen = config.keyLen; 
var cachestore = redis.createClient(config.redisPort, config.redisHost, {});
// apps CSP header
var csp_hdr = "default-src 'self'; ";
// webkit-tests path
var webkit_tests = '../webkit-tests';
// webkit-tests2 path (CSP1.1 or level 2)
var webkit_tests2 = '../webkit-tests/1.1';
// filter html files
var pattern = /^[\w, -]{1,48}\.html$/;

//
/* GET home page. */
router.get('/', function(req, res) {
 
  /* // User Agent parser
  var r = require('ua-parser').parse(req.headers['user-agent']); 
  console.log(r.ua.toString());        // -> "Safari 5.0.1" 
  console.log(r.ua.toVersionString()); // -> "5.0.1" 
  console.log(r.ua.family)             // -> "Safari" 
  console.log(r.ua.major);             // -> "5" 
  console.log(r.ua.minor);             // -> "0" 
  console.log(r.ua.patch);             // -> "1" 
 
  console.log(r.os.toString());        // -> "iOS 5.1" 
  console.log(r.os.toVersionString()); // -> "5.1" 
  console.log(r.os.family)             // -> "iOS" 
  console.log(r.os.major);             // -> "5" 
  console.log(r.os.minor);             // -> "1" 
  console.log(r.os.patch);             // -> null 
 
  console.log(r.device.family);        // -> "iPhone" 
  */

  res.set('content-security-policy', csp_hdr);
  res.render('index', { title: title, userinput: undefined });
});

/* Healthcheck URL */
router.get('/status.html', function(req, res) {
  res.set('content-security-policy', csp_hdr);
  res.set('content-type', 'text/plain');
  res.set('connection', 'close');
  res.status(200).send('OK');
});

/* GET home page with preloaded inputs. */
router.get('/webkit-tests', function(req, res) {
  try {
    fs.readdir(path.join(__dirname, webkit_tests), function(err, files) {
      if (err) { 
        console.log('Read failed: ' + err.message);
        res.set('content-security-policy', csp_hdr);
        res.render('index', { title: title, userinput: undefined });
        return;
      }

      var tests = [];
      var i = 0;
      files.forEach(function(filename) {
        //console.log('file: ' + filename);
        if (pattern.test(filename)) {
          tests[i++] = filename;
        }

      });

      res.set('content-security-policy', csp_hdr);
      res.render('webkit-tests', { title: title, tests: tests, hostname: hostname,
                           hostport: req.socket.localPort,
                           hostip: req.socket.localAddress, csp11: false });
     
    });
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }
});

/* GET preloaded CSP level 2 scripts (from Chrome) */
router.get('/webkit-tests2', function(req, res) {

  try {
    fs.readdir(path.join(__dirname, webkit_tests2), function(err, files) {
      if (err) {
        console.log('Read failed: ' + err.message);
        res.set('content-security-policy', csp_hdr);
        res.render('index', { title: title, userinput: undefined });
        return;
      }

      var tests = [];
      var i = 0;
      files.forEach(function(filename) {
        //console.log('file: ' + filename);
        if (pattern.test(filename)) {
          tests[i++] = filename;
        }
      });

      res.set('content-security-policy', csp_hdr);
      res.render('webkit-tests', { title: title, tests: tests, hostname: hostname,
                           hostport: req.socket.localPort,
                           hostip: req.socket.localAddress, csp11: true });

    });
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }
});


/* GET home page with preloaded inputs. */
router.get('/:id', function(req, res) {
  try {
    var key = req.params.id;
    res.set('content-security-policy', csp_hdr);

    if ((key != undefined) && (key)) {
      key = key.slice(0, keylen);
      cachestore.get(key, function (err, result) {

        if (err || !result) {
          console.log(key + ' : key not found');
        } else {
          var j = JSON.parse(result);
          res.render('index', { title: title, userinput: j });
        }
      });

      var filename = req.params.id;
      // a crude input filter
      if (pattern.test(filename)) {
        fs.readFile(path.join(__dirname, webkit_tests + '/' + filename), 'utf8', 
                                                      function (error, data) {
          if (error) {
            // lets check it in 1.1 dir
            fs.readFile(path.join(__dirname, webkit_tests2 + '/' + filename), 'utf8',
                                                      function (error, data) {
              if (error) {
                res.render('index', { title: title, userinput: undefined });
                return;
              }

              var input = { 'cspheader' : '', 'htmlcode' : data };
              res.render('index', { title: title, userinput: input });
            });

            return;
          }

          var input = { 'cspheader' : '', 'htmlcode' : data };
          res.render('index', { title: title, userinput: input });
        });

      } 

      //res.render('index', { title: title, userinput: undefined });
    }
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }

});

/* GET WebKit csp test page. */
router.get('/webkit-test/:id', function(req, res) {
  try {

    var filename = req.params.id;
    // a crude input filter
    if (pattern.test(filename)) {
      fs.readFile(path.join(__dirname, webkit_tests + '/' + filename), 'utf8',
                                                      function (error, data) {
        if (error) {
          res.status(400).send('Bad Request');
          return;
        }

        var input = { 'cspheader' : '', 'htmlcode' : data };
        var key = randomstring.generate(keylen);
        cachestore.setex(key, expiry, JSON.stringify(input), redis.print);

        var csp_hdr2 = csp_hdr + ' frame-src http://' + req.socket.localAddress + ':' + req.socket.localPort + ';';
        res.set('content-security-policy', csp_hdr2);
        res.render('test', { title: title,
                         testid: key,
                         hostport: req.socket.localPort,
                         hostip: req.socket.localAddress });

      });
    }

  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }
});

/* GET WebKit csp1.1 test page. */
router.get('/webkit-test2/:id', function(req, res) {
  try {

    var filename = req.params.id;
    // a crude input filter
    if (pattern.test(filename)) {
      fs.readFile(path.join(__dirname, webkit_tests2 + '/' + filename), 'utf8',
                                                      function (error, data) {
        if (error) {
          res.status(400).send('Bad Request');
          return;
        }

        var input = { 'cspheader' : '', 'htmlcode' : data };
        var key = randomstring.generate(keylen);
        cachestore.setex(key, expiry, JSON.stringify(input), redis.print);

        var csp_hdr2 = csp_hdr + ' frame-src http://' + req.socket.localAddress + ':' + req.socket.localPort + ';';
        res.set('content-security-policy', csp_hdr2);
        res.render('test', { title: title,
                         testid: key,
                         hostport: req.socket.localPort,
                         hostip: req.socket.localAddress });

      });
    }

  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }
});

/* GET test page. */
router.post('/test', function(req, res) {
 try {

    var key = randomstring.generate(keylen);
    cachestore.setex(key, expiry, JSON.stringify(req.body), redis.print);

    if (req.body.windowtop) {
      res.set('content-security-policy', csp_hdr);
      res.render('test-window', { title: title,
                         testid: key,
                         hostname: hostname, 
                         hostport: req.socket.localPort, 
                         hostip: req.socket.localAddress,
                         sharelink: false,
                         showlink: false,
                         linkexpiry: 0 });
    } else {
      var csp_hdr2 = csp_hdr + ' frame-src http://' + req.socket.localAddress + ':' + req.socket.localPort + ';';
      res.set('content-security-policy', csp_hdr2);
      res.render('test', { title: title,
                         testid: key,
                         hostport: req.socket.localPort,
                         hostip: req.socket.localAddress });
    }

  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }
});

/* GET test-share page. */
router.get('/test-share/:id', function(req, res) {
 try {

    var key = req.params.id;
    var ts = req.query.ts;
    var current = new Date().getTime(); 
    if ((ts === undefined) || (!ts) || isNaN(ts) || (ts < current)) {
      ts = current; // sorry i cant help :(
    } 

    // checking the existence is good enough 
    var showlink = true;
    if (req.query.sl === undefined) {
      showlink = false;
    }

    cachestore.exists(key, function (err, result) {
      if (err || !result) {
        console.log(key + ' : key not found');
        res.status(400).send('<h2>Page not found. URL is expired</h2> <a href="/">Home</a>');
        return;
      } else {
        // extend the expiry
        cachestore.expire(key, linkexpiry_ms);
        var lets = parseInt(ts);
        lets += parseInt(linkexpiry_ms);
        var sessionkey = key + '-' + randomstring.generate(7);
        res.set('content-security-policy', csp_hdr);
        res.render('test-window', { title: title,
                         testid: sessionkey,
                         hostname: hostname, 
                         hostport: req.socket.localPort, 
                         hostip: req.socket.localAddress,
                         sharelink: true,
                         showlink: showlink,
                         linkexpiry: lets });
      }
    });

  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }
});

/* GET test/id page. */
router.get('/test/:id', function(req, res) {
  try {

    // Yes, this is not a strong security assertion. Ideally tests should be
    // handled in a separate vhost. Also the recommendation is to host this 
    // app in a separate domain
    if (req.hostname != req.socket.localAddress) {
      res.status(400).send('<h2>Page not found</h2> <a href="/">Home</a>');
      return;
    }

    var sessionkey = req.params.id;
    var reporturi = '; report-uri /report/' + sessionkey;
    var key = sessionkey.slice(0, keylen);

    cachestore.get(key, function (err, result) {
      if (err || !result) {
        console.log(key + ' : key not found');
        res.status(400).send('<h2>Page not found. URL is expired</h2> <a href="/">Home</a>');
        return;
      } else {
        var j = JSON.parse(result);

        // cspheader can be empty
        if (j.cspheader) {
          if (j.hasOwnProperty('reportonly')) {
            res.set('content-security-policy-report-only', (j.cspheader).concat(reporturi));
            res.set('X-Content-Security-Policy-Report-Only', (j.cspheader).concat(reporturi));
            res.set('X-WebKit-CSP-Report-Only', (j.cspheader).concat(reporturi));
          } else {
            res.set('content-security-policy', (j.cspheader).concat(reporturi));
            res.set('X-Content-Security-Policy', (j.cspheader).concat(reporturi));
            res.set('X-WebKit-CSP', (j.cspheader).concat(reporturi));
          }
        }

        // to deal with CSP meta tag in the HTML file
        // eg: <meta http-equiv="Content-Security-Policy" content="script-src none; report-uri $CSP_REPORT_URI ">  
        var code = j.htmlcode.replace(/\$CSP_REPORT_URI/g, '/report/' + sessionkey);
        res.send(code);
        //res.send(j.htmlcode);
      }
    });

  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }
});

/* POST report/id page. */
router.post('/report/:id', function(req, res) {
  try {

    var id = ('report_').concat(req.params.id);
    cachestore.rpush(id, JSON.stringify(req.body), redis.print);
    cachestore.expire(id, expiry);
    res.status(204).end();

  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }
});

/* GET report/id page. */
router.get('/report/:id', function(req, res) {
  try {
    var id = ('report_').concat(req.params.id);

    cachestore.lrange(id, 0, -1, function(err, records){
      var len = records === null ? 0 : records.length;
      console.log('REDIS RECORDS LEN: ' + len);
      if (len > 0) {
        /*for (var i=0; i<len; i++) {
          var report = JSON.parse(records[i]);
          console.log('|----> ' + report['csp-report']['document-uri']);
          console.log('|---->> ' + report['csp-report']['referrer']);
          console.log('|---->> ' + report['csp-report']['violated-directive']);
          console.log('|---->> ' + report['csp-report']['blocked-uri']);
        }

        cachestore.ttl(id, function(err, ttl){
          console.log('TTL: ' + ttl);
        });
        */

        res.set('content-security-policy', csp_hdr);
        res.render('cspreport', { records: records });
      } else {
        res.status(200);
        res.end();
      }
    });

  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }

});

/* GET report2/id page. */
router.get('/report2/:id', function(req, res) {
  try {
    res.set('content-security-policy', csp_hdr);
    res.render('test-report', { title: title, testid: req.params.id });
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }

});

/*-----------------------------------------*/
/* CSP 1.1 testing - A dummy form endpoint */
/*-----------------------------------------*/
router.get('/test/csp11/form-target', function(req, res) {
  try {
    res.set('content-security-policy', csp_hdr);
    res.status(200).send('Form submit OK');
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }

});

router.post('/test/csp11/form-target', function(req, res) {
  try {
    res.set('content-security-policy', csp_hdr);
    res.status(200).send('Form submit OK');
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }

});

router.get('/test/csp11/redirect', function(req, res) {
  try {
    res.set('content-security-policy', csp_hdr);
    res.redirect(302, 'http://example.com');
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }

});

router.post('/test/csp11/redirect', function(req, res) {
  try {
    res.set('content-security-policy', csp_hdr);
    res.redirect(302, 'http://example.com');
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }

});

router.get('/test/csp11/mock-plugin', function(req, res) {
  try {
    res.set('Content-Type', 'application/x-webkit-test-netscape');
    res.status(200).send('This is a mock plugin. It does pretty much nothing.');
  } catch (err) {
    // handle the error safely
    console.log(err);
    res.status(400).send('Bad Request');
  }

});
/*-----------------------------------------*/
/* CSP 1.1 testing - END                   */
/*-----------------------------------------*/

module.exports = router;
