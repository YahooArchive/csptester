//
// Copyright (c) 2015, Yahoo Inc.
// Copyrights licensed under the New BSD License. See the
// accompanying LICENSE.txt file for terms.
//
//   Author Binu P. Ramakrishnan
//   Created 01/05/2015
//
// csptester configuration file

// website title
exports.title='Content Security Policy Tester';

// listen port
exports.port=3000;

// TLS (SSL) settings
//  0 => TLS disabled (no TLS), 
//  1 => TLS enabled, 
//  2 => Listen on both TLS and non-TLS ports 
exports.tls=0;
exports.tlsPort=4443;
exports.tlsKey='/path/to/tls/private/key';
exports.tlsCert='/path/to/tls/public/cert';

// how long to cache user input and violation reports?
// 240 sec (or 4 minutes) 
exports.ephemeralCache=240;

// shareable link expiry time - 48 hours in milliseconds
exports.longLivedCache=172800000;

// key/record id str len
exports.keyLen=16;

// redis port
exports.redisPort=6379;

// redis hostname
exports.redisHost='127.0.0.1';

