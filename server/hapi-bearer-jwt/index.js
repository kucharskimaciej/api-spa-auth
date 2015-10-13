var Hapi = require('hapi');
var Boom = require('boom');
var Bearer = require('./lib/bearer_scheme');
var jwt = require('jsonwebtoken');
var server = new Hapi.Server();
server.connection({port: 3000, host: 'localhost'});

var userTokenMap = {};
var users = require('./users.json');
var secret = "shhh";

server.register(Bearer, function(err) {
    server.auth.strategy('jsonwebtoken', 'jwt', {
        validateFunc: function(token, cb) {
            var data;

            try {
                data = jwt.verify(token, secret);
            } catch (err) {
                return cb(null, false);
            }

            if(Date.now() > Number(data.expires)) {
                return cb('Token expired', false);
            }

            if(userTokenMap[data.id] !== token) {
                return cb(null, false);
            }

            return cb(null, true, users[data.id]);
        }
    });

    server.route({
        method: 'POST',
        path: '/login',
        config: {
            handler: function (request, reply) {
                var user = users.filter(function($){
                    return $.email === request.payload.email &&
                        $.password === request.payload.password;
                })[0];

                if(!user) {
                    return reply(Boom.unauthorized('Invalid email or password'));
                }

                var token = jwt.sign({
                    id: user.id,
                    expires: Date.now() + 10*60*1000
                }, secret);

                userTokenMap[user.id] = token;

                return reply({
                    token: token
                });
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/me',
        config: {
            auth: 'jsonwebtoken',
            handler: function(request, reply) {
                reply(users[request.auth.credentials.id]);
            }
        }
    });



    server.route({
        method: 'POST',
        path: '/logout',
        config: {
            auth: 'jsonwebtoken',
            handler: function (request, reply) {
                delete userTokenMap[request.auth.credentials.id];
                reply(200);
            }
        }
    });

    server.start(function() {
        console.log('server running at: ' + server.info.uri);
    });
});