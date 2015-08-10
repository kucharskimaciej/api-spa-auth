var Hapi = require('hapi');
var basicScheme = require('./lib/basic_scheme');
var server = new Hapi.Server();

var CONST = {
    port: 9001
};

server.connection({ port: CONST.port });

server.auth.scheme('basic', basicScheme);
server.auth.strategy('basic-auth', 'basic', false, {
    user: { login: 'test', password: 'test123' }
});
server.auth.default('basic-auth');

// protected route
server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        return reply("SUCCESS");
    }
});

server.start(function(err) {
   console.log("HAPI-BASIC is listening on " + CONST.port);
});