var winston = require('winston');
var Scribe = require('..');

var scribeTransport = new Scribe({
    version: '1',
    app: 'winston-common-scribe-demo'
    host: '{{ YOUR scribe HOST }}',
    port: '{{ YOUR scribe PORT }}',
    category: '{{ YOUR scribe CATEGORY }}',
});

var logger = new winston.Logger({
    transports: [scribeTransport],
});

logger.warn('This is warning message');
try {
    throw new Error('some error');
} catch(err) {
    logger.error('This is error message', {error: err});
}
