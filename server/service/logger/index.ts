import winston = require('winston');
import config = require('config');


const transports = [
  new winston.transports.Console({
    level: config.isDebug ? 'debug' : 'info',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false,
    colorize: true,
  }),
];

winston.configure({
  transports,
  exitOnError: false,
});

export default winston;
