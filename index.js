'use strict';
var os = require('os');
var util = require('util');
var winston = require('winston');
var Client = require('scribe').Scribe;

/**
 * options
 *     [version]
 *     [app]
 *     [level]
 *     host
 *     port
 *     category
 */
var Scribe = winston.transports.Scribe = function (options) {
    //
    // Name this logger
    //
    this.name = 'scribe';

    //
    // Set the level from your options
    //
    this.level = options.level || 'silly';

    var self = this;
    this.version = options.version || '1';
    this.app = options.app || 'winston';
    this.category = options.category;
    this.host = os.hostname();
    this.client = new Client(options.host, options.port, {autoReconnect: true});
    this.client.open(function(err) {
        if (err) {
            self.emit('error', err);
            return;
        }
    });
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(Scribe, winston.Transport);

Scribe.LEVELS_MAP = {
    silly: 'SILLY',
    verbose: 'VERBOSE',
    info: 'INFO',
    debug: 'DEBUG',
    warn: 'WARN',
    error: 'ERROR',
};

/**
 * Log format
 *
 * version: Log format version
 * app: Centralized log manage system application name
 * host
 * level: info, warn, error etc
 * message
 * timestamp
 * type: In meta, log type, such as system internal log or request log
 * [requestID]: optional, in meta, universal request id
 * [error]: optional, in meta, should only appear when level is error
 */
Scribe.prototype.log = function (level, message, meta, callback) {
    if (level === 'error' && meta.error instanceof Error) {
        message = message + ': ' + meta.error.message + ' -- ' + meta.error.stack;
    }
    level = Scribe.LEVELS_MAP[level] || this.level;
    var version = this.version;
    var app = this.app;
    var host = this.host;
    var timestamp = Math.floor(Date.now() / 1000);
    // default log type is system log
    var type = meta.type || 'system';
    var requestID = meta.requestID || 'default';

    var log = util.format('version=%s app=%s host=%s level=%s timestamp=%s type=%s requestID=%s message=%s\n', version, app, host, level, timestamp, type, requestID, message);
    this.client.send(this.category, log);
    callback(null, true);
};

module.exports = Scribe;
