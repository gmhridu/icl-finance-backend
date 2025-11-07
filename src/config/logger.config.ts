import winston from 'winston';
import { Env } from './env.config';

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define custom colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Apply colors to the log levels
winston.addColors(colors);

// Define the format for console logs
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define the format for file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Define which transports the logger must use
const transports = [
  // Allow the use of the console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // Allow logging to a file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
  }),
  // Allow logging to a file
  new winston.transports.File({
    filename: 'logs/all.log',
    format: fileFormat,
  }),
];

// Create the logger instance
const Logger = winston.createLogger({
  level: Env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  transports,
});

export default Logger;