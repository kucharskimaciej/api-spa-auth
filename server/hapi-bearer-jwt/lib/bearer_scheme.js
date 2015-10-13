var Boom = require('boom');
var Hoek = require('hoek');

var authorizationHeaderRegexp = /^\s*Bearer ([A-z0-9\-\=\/_\.~]+=*)\s*$/i;
function parse(authHeader) {
    var match = authHeader.match(authorizationHeaderRegexp);
    return match && match[1];
}


var internal = {};
// should be used as a Hapi plugin
exports.register = function(plugin, options, next) {
    plugin.auth.scheme('jwt', JsonWebTokenAuthenticationScheme);
    next();
};

exports.register.attributes = {
    name: 'JWT-Scheme',
    version: '1.0.0'
};

exports.createToken = function(claim) {
    return jwt.sign(claim, internal.secret);
};

function JsonWebTokenAuthenticationScheme(server, options) {

    // assert that the required parts are set by user
    Hoek.assert(options, 'You need to provide configuration object');
    Hoek.assert(typeof options.validateFunc == 'function', 'You need to provide validate function');

    // clone the options to avoid messing with objects outside
    var opts = Hoek.clone(options);

    return {
        authenticate: function (request, reply) {
            var token;
            token = parse(request.raw.req.headers.authorization);

            if (!token) {
                return reply(Boom.unauthorized());
            }

            opts.validateFunc(token, function(err, isValid, user) {
                if(err) {
                    return reply(Boom.unauthorized(err));
                }

                if (!isValid) {
                    return reply(Boom.unauthorized('Bad username or password'));
                }

                reply.continue({
                    credentials: {
                        id: user.id
                    }
                });
            });

        }
    };
}