var Boom = require('boom');
var authorizationHeaderRegexp = /^\s*Basic ([A-z0-9\-\=\/_~]+=*)\s*$/i;

function decode(base64) {
    return base64 && new Buffer(base64, 'base64').toString();
}

function parse(authHeader) {
    var match = authHeader.match(authorizationHeaderRegexp);
    return match && match[1];
}

module.exports = function (server, options) {

    return {
        authenticate: function (request, reply) {
            var encodedCredentials = parse(request.raw.req.headers.authorization || "");
            var authorization = decode(encodedCredentials);

            if (!authorization || authorization !== options.user.login + ":" + options.user.password) {
                return reply(Boom.unauthorized(null, 'basic'));
            }

            return reply.continue({credentials: {user: options.user.login}});
        }
    };
};