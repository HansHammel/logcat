#!/usr/bin/env node

var argv = process.argv.slice(2);
var open = require('open');

var app = require('../index.js');
var port = parseInt(argv[0], 10) || 3000;
var server = app.listen(port, function(){
    console.log('Express listening on http://localhost:'+port);
    console.log('visit http://localhost:'+port+' to see your filtred adb logs');
    open('http://localhost:'+port);
});