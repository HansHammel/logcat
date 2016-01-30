/*jslint node:true,nomen:true*/

/*
D/ActivityManager
D/CordovaActivity
D/CordovaNetworkManager
D/CordovaWebViewClient
D/PanelView
D/ResourcesManager
D/XWalkActivity
D/XWalkLib
E/AndroidRuntime
E/chromium
E/Web Console
I/ActivityManager
I/App
I/chromium
I/InputReader
I/Timeline
I/WindowManager
V/ActivityThread
V/ApplicationPolicy
V/KeyguardUpdateMonitor
W/PackageManager
W/PluginManager
W/ResourcesManager
W/System.err
*/
// filter only on CordovaLog debug messages skip all other
// adb logcat CordovaLog:D *:S

var util = require('util'),
	colors = require('colors'),
  os= require('os'),
  express = require('express'),
	app = require('express.io')(),
	spawn = require('child_process').spawn,
    logcat = spawn('adb', ['logcat']),
	state = {
		'success': [/*'success',*/ 'D\/ActivityManager', 'D\/CordovaActivity', 'D\/CordovaNetworkManager', 'D\/CordovaWebViewClient', 'D\/PanelView', 'D\/ResourcesManager', 'D\/XWalkActivity', 'D\/XWalkLib', 'D\/CordovaLog'],
		'danger': [/*'error',*/ /*'E\/',*/ 'E\/AndroidRuntime', 'E\/chromium', 'E\/Web Console'],
		'warning': [/*'warning',*/ 'W\/Web Console', 'W\/System\.err', 'W\/ResourcesManager', 'W\/PackageManager'],
		'info': [/*'info',*/ 'I\/ActivityManager', 'I\/App', 'I\/chromium', 'I\/InputReader', 'I\/Timeline', 'I\/WindowManager']
	},
    parseStdout = function (data, _class) {
        'use strict';
        data.toString().split(os.EOL).forEach(function (line) {
            if (line !== '') {
                var type = [''];
                if (state.hasOwnProperty(_class)) {
                    type.push(_class);
                } else {
                    Object.keys(state).forEach(function (k) {
                        if (util.isArray(state[k])) {
                            state[k].forEach(function (rx) {
                                var r = new RegExp(rx);
                                if (r.test(line)) {
                                    type.push(k);
                                }
                            });
                        }
                    });
                }

                if (type.indexOf('danger') >= 0) {
                    console.log(line.red.bold);
                    app.io.broadcast('line', {'line': line, 'type': 'danger'});
                } else if (type.indexOf('warning') >= 0) {
                    console.log(line.yellow.bold);
                    app.io.broadcast('line', {'line': line, 'type': 'warning'});
                } else if (type.indexOf('success') >= 0) {
                    console.log(line.green.bold);
                    app.io.broadcast('line', {'line': line, 'type': 'success'});
                } else if (type.indexOf('info') >= 0) {
                    console.log(line.blue.bold);
                    app.io.broadcast('line', {'line': line, 'type': 'info'});
                } else {
                  //skip/filter leave the rest
                    //console.log(line.white.bold);
                    //app.io.broadcast('line', {'line': line, 'type': type[0]});
                }
            }
        });
    };

app.http().io();
app.use('/vendor/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/vendor/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.get('/', function (req, res) {'use strict'; res.sendfile(__dirname + '/public/client.html'); });
app.get('/js/jquery-1.9.1.min.js', function (req, res) {'use strict'; res.sendfile(__dirname + '/public/js/jquery-1.9.1.min.js'); });
app.get('/js/bootstrap.min.js', function (req, res) {'use strict'; res.sendfile(__dirname + '/public/js/bootstrap.min.js'); });
app.get('/css/bootstrap.min.css', function (req, res) {'use strict'; res.sendfile(__dirname + '/public/css/bootstrap.min.css'); });

var fs=require('fs');
var serverAccessLogStream = fs.createWriteStream('log.log', {flags: 'w'}); //use a for append
logcat.stdout.on('data', function (data) {'use strict';
  //serverAccessLogStream.write(data);
  parseStdout(data);
});
logcat.stderr.on('data', function (data) {'use strict';
  //parseStdout(data, 'danger');
});
logcat.on('error', function (data) {
    'use strict';
    //parseStdout(data, 'danger');
});

app.listen(3008);

//module.exports = app;
