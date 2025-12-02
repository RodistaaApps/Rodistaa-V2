/**
 * Common Type Definitions
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    timestamp: Date;
    requestId: string;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId: string;
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

