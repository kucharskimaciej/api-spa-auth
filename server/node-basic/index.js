"use strict";
var http = require('http');

var user, server, authorizationHeaderRegexp;

user = {
    password : 'secret',
    login    : 'secret'
};
authorizationHeaderRegexp = /^\s*Basic ([A-z0-9\-\=\/_~]+=*)\s*$/i;

server = http.createServer(function(req, res) {
    var encodedCredentials = parse(req.headers.authorization || "");
    var credentials = decode(encodedCredentials);

    if(credentials === user.login + ":" + user.password) {
        res.end('Login succesfull');
    } else {
        res.statusCode = 401;
        res.end('Login failed');
    }
});

server.listen(3000);

function decode(base64) {
    return new Buffer(base64, 'base64').toString();
}

function parse(authHeader) {
    var match = authHeader.match(authorizationHeaderRegexp);
    return match && match[1];
}
