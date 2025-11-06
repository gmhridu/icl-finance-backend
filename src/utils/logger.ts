import Logger from '@/config/logger.config';

// Create a custom logger interface to make it easier to use
class AppLogger {
  // Log an error message
  static error(message: string, meta?: any): void {
    Logger.error(message, meta);
  }

  // Log a warning message
  static warn(message: string, meta?: any): void {
    Logger.warn(message, meta);
  }

  // Log an info message
  static info(message: string, meta?: any): void {
    Logger.info(message, meta);
  }

  // Log an HTTP message (for request logging)
  static http(message: string, meta?: any): void {
    Logger.http(message, meta);
  }

  // Log a debug message
  static debug(message: string, meta?: any): void {
    Logger.debug(message, meta);
  }

  // Log an HTTP request
  static logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
  ): void {
    const message = `${method} ${url} ${statusCode} ${responseTime}ms`;
    const meta = userId ? { userId } : undefined;
    Logger.http(message, meta);
  }
}

export default AppLogger;