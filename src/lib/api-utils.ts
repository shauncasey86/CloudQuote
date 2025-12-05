// src/lib/api-utils.ts
// Shared API utilities for consistent error handling and response formatting

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * Creates a successful API response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data }, { status });
}

/**
 * Creates an error API response
 */
export function errorResponse(
  error: string,
  status = 500,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ error, details }, { status });
}

/**
 * Extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Logs API errors consistently
 */
export function logApiError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[API ${context}]`, { message, stack, timestamp: new Date().toISOString() });
}

/**
 * Handles API errors consistently, returning appropriate response
 */
export function handleApiError(
  error: unknown,
  context: string
): NextResponse<ApiResponse<never>> {
  logApiError(context, error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse('Validation error', 400, error.errors);
  }

  // Handle known error types
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('not found')) {
      return errorResponse(error.message, 404);
    }
    if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
      return errorResponse('Unauthorized', 401);
    }
    if (error.message.includes('forbidden') || error.message.includes('Forbidden')) {
      return errorResponse('Forbidden', 403);
    }
  }

  // Default server error
  return errorResponse('Internal server error', 500);
}

/**
 * Common HTTP status codes with descriptions
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
