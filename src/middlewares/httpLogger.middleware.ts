import { NextFunction, Request, Response } from 'express';
import AppLogger from '@/utils/logger';

// Middleware to log HTTP requests
const httpLogger = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Capture the start time
    const startTime = Date.now();

    // Listen for the response finish event
    res.on('finish', () => {
      // Calculate the response time
      const responseTime = Date.now() - startTime;
      
      // Extract user ID if available
      const userId = (req as any).user?.id || undefined;

      // Log the request
      AppLogger.logRequest(
        req.method,
        req.originalUrl,
        res.statusCode,
        responseTime,
        userId,
      );
    });

    next();
  };
};

export default httpLogger;