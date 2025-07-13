// eslint-disable-next-line @typescript-eslint/no-var-requires
const winston = require('winston');

const infoLogger = winston.createLogger({
  levels: { info: 0 },
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ level: 'info' }),
    new winston.transports.File({ level: 'info', filename: 'info.log' }),
  ],
});

const compilerLogger = winston.createLogger({
  levels: { compiler: 1 },
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ level: 'compiler' }),
    new winston.transports.File({
      level: 'compiler',
      filename: 'compiler.log',
    }),
  ],
});

export { infoLogger, compilerLogger };
