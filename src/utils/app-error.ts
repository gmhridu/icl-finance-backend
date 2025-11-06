import { HTTPSTATUS, HttpStatusCodeType } from "../config/http.config";
import { ZodError } from "zod";
import { PostgresError } from "postgres";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const ErrorCodes = {
  ERR_INTERNAL: "ERR_INTERNAL",
  ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
  ERR_VALIDATION: "ERR_VALIDATION",
  ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
  ERR_FORBIDDEN: "ERR_FORBIDDEN",
  ERR_NOT_FOUND: "ERR_NOT_FOUND",
  ERR_CONFLICT: "ERR_CONFLICT",
  ERR_RATE_LIMIT: "ERR_RATE_LIMIT",
  ERR_SERVICE_UNAVAILABLE: "ERR_SERVICE_UNAVAILABLE",
  ERR_DB_UNIQUE_VIOLATION: "ERR_DB_UNIQUE_VIOLATION",
  ERR_DB_FOREIGN_KEY: "ERR_DB_FOREIGN_KEY",
  ERR_DB_CHECK_VIOLATION: "ERR_DB_CHECK_VIOLATION",
  ERR_DB_NOT_NULL: "ERR_DB_NOT_NULL",
  ERR_JWT_EXPIRED: "ERR_JWT_EXPIRED",
  ERR_JWT_INVALID: "ERR_JWT_INVALID",
  ERR_JWT_MALFORMED: "ERR_JWT_MALFORMED",
} as const;

export type ErrorCodeType = keyof typeof ErrorCodes;

export interface ErrorResponse {
  success: false;
  timestamp: string;
  requestId: string;
  errorCode: ErrorCodeType;
  message: string;
  details?: any;
  field?: string;
  stack?: string[];
}

export class AppError extends Error {
  public readonly isOperational = true;
  public readonly timestamp = new Date().toISOString();

  constructor(
    message: string,
    public statusCode: HttpStatusCodeType,
    public errorCode: ErrorCodeType,
    public details?: any,
    public field?: string
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(requestId: string, isDev: boolean): ErrorResponse {
    const base = {
      success: false as const,
      timestamp: this.timestamp,
      requestId,
      errorCode: this.errorCode,
      message: this.message,
      ...(this.details && { details: this.details }),
      ...(this.field && { field: this.field }),
    };

    return isDev
      ? { ...base, stack: this.stack?.split("\n").map((s) => s.trim()) }
      : base;
  }
}

/* ================== Core HTTP Exceptions ================== */
export class InternalServerException extends AppError {
  constructor(message = "An unexpected error occurred on the server.") {
    super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL);
  }
}

export class BadRequestException extends AppError {
  constructor(message = "The request is malformed or missing required data.", details?: any) {
    super(message, HTTPSTATUS.BAD_REQUEST, ErrorCodes.ERR_BAD_REQUEST, details);
  }
}

export class ValidationException extends AppError {
  constructor(message = "Validation failed.", details?: any) {
    super(message, HTTPSTATUS.UNPROCESSABLE_ENTITY, ErrorCodes.ERR_VALIDATION, details);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Authentication is required to access this resource.") {
    super(message, HTTPSTATUS.UNAUTHORIZED, ErrorCodes.ERR_UNAUTHORIZED);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, HTTPSTATUS.FORBIDDEN, ErrorCodes.ERR_FORBIDDEN);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "The requested resource could not be found.") {
    super(message, HTTPSTATUS.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND);
  }
}

export class ConflictException extends AppError {
  constructor(message = "The request conflicts with the current state of the server.", details?: any) {
    super(message, HTTPSTATUS.CONFLICT, ErrorCodes.ERR_CONFLICT, details);
  }
}

export class RateLimitException extends AppError {
  constructor(message = "Too many requests. Please try again later.", retryAfter?: number) {
    super(message, HTTPSTATUS.TOO_MANY_REQUESTS, ErrorCodes.ERR_RATE_LIMIT, retryAfter ? { retryAfter } : undefined);
  }
}

export class ServiceUnavailableException extends AppError {
  constructor(message = "Service is temporarily unavailable. Please try again later.") {
    super(message, HTTPSTATUS.SERVICE_UNAVAILABLE, ErrorCodes.ERR_SERVICE_UNAVAILABLE);
  }
}

/* ================== Database Exceptions (PostgreSQL / Drizzle) ================== */
export class DatabaseException extends AppError {
  constructor(message: string, code: ErrorCodeType, details?: any) {
    super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, code, details);
  }
}

export class UniqueViolationException extends AppError {
  constructor(field: string, value: any) {
    super(
      `The value '${value}' already exists for field '${field}'.`,
      HTTPSTATUS.CONFLICT,
      ErrorCodes.ERR_DB_UNIQUE_VIOLATION,
      { field, value },
      field
    );
  }
}

export class ForeignKeyViolationException extends AppError {
  constructor(field: string, constraint: string) {
    super(
      `Invalid reference: '${field}' violates foreign key constraint '${constraint}'.`,
      HTTPSTATUS.BAD_REQUEST,
      ErrorCodes.ERR_DB_FOREIGN_KEY,
      { field, constraint },
      field
    );
  }
}

export class CheckViolationException extends AppError {
  constructor(constraint: string, details?: any) {
    super(
      `Data violates check constraint: ${constraint}.`,
      HTTPSTATUS.BAD_REQUEST,
      ErrorCodes.ERR_DB_CHECK_VIOLATION,
      details
    );
  }
}

export class NotNullViolationException extends AppError {
  constructor(field: string) {
    super(
      `Field '${field}' cannot be null.`,
      HTTPSTATUS.BAD_REQUEST,
      ErrorCodes.ERR_DB_NOT_NULL,
      { field },
      field
    );
  }
}

/* ================== JWT / Auth Exceptions ================== */
export class JwtExpiredException extends AppError {
  constructor() {
    super("Token has expired. Please log in again.", HTTPSTATUS.UNAUTHORIZED, ErrorCodes.ERR_JWT_EXPIRED);
  }
}

export class JwtInvalidException extends AppError {
  constructor(message = "Invalid token.") {
    super(message, HTTPSTATUS.UNAUTHORIZED, ErrorCodes.ERR_JWT_INVALID);
  }
}

export class JwtMalformedException extends AppError {
  constructor() {
    super("Malformed token.", HTTPSTATUS.UNAUTHORIZED, ErrorCodes.ERR_JWT_MALFORMED);
  }
}

/* ================== Zod Helper ================== */
export const handleZodError = (error: ZodError): ValidationException => {
  const fieldErrors = error.issues.reduce((acc, err) => {
    const path = err.path.join(".");
    if (!acc[path]) acc[path] = [];
    acc[path].push(err.message);
    return acc;
  }, {} as Record<string, string[]>);

  return new ValidationException("Invalid input data.", fieldErrors);
};

/* ================== PostgreSQL / Drizzle Helper ================== */
export const handlePostgresError = (error: any): AppError => {
  // For postgres (node-postgres) or pg
  if (error instanceof PostgresError || error.code) {
    const pgError = error as PostgresError;

    switch (pgError.code) {
      case "23505": // unique_violation
        const detail = pgError.detail || "";
        const match = detail.match(/\((.*?)\)=\((.*?)\)/);
        const field = match?.[1] || "unknown";
        const value = match?.[2] || "unknown";
        return new UniqueViolationException(field, value);

      case "23503": // foreign_key_violation
        return new ForeignKeyViolationException(pgError.column_name || "unknown", pgError.constraint_name || "unknown");

      case "23514": // check_violation
        return new CheckViolationException(pgError.constraint_name || "unknown", pgError.detail);

      case "23502": // not_null_violation
        return new NotNullViolationException(pgError.column_name || "unknown");

      default:
        return new DatabaseException(`Database error: ${pgError.message}`, ErrorCodes.ERR_INTERNAL, {
          code: pgError.code,
          detail: pgError.detail,
        });
    }
  }

  // Fallback
  return new InternalServerException("Database operation failed.");
};

/* ================== JWT Helper ================== */
export const handleJwtError = (error: any): AppError => {
  if (error instanceof TokenExpiredError) {
    return new JwtExpiredException();
  }
  if (error instanceof JsonWebTokenError) {
    if (error.message === "jwt malformed") {
      return new JwtMalformedException();
    }
    return new JwtInvalidException(error.message);
  }
  return new UnauthorizedException("Authentication failed.");
};
