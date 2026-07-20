import { LearningPageError } from './error-types';

export interface ErrorLogMetadata {
  timestamp: string;
  message: string;
  type: string;
  status: number;
  context: string;
  stack?: string;
  originalError?: any;
}

/**
 * Structured error logger that outputs telemetry-ready metadata.
 * Ready for future integrations like Sentry, LogRocket, or OpenTelemetry.
 */
export function logError(error: any, context: string) {
  const timestamp = new Date().toISOString();

  let formattedError: ErrorLogMetadata;

  if (error instanceof LearningPageError) {
    formattedError = {
      timestamp,
      message: error.message,
      type: error.type,
      status: error.status,
      context,
      stack: error.stack,
      originalError: error,
    };
  } else if (error && typeof error === 'object') {
    formattedError = {
      timestamp,
      message: error.message || String(error),
      type: error.type || 'unknown',
      status: error.status || (error.response?.status || 500),
      context,
      stack: error.stack,
      originalError: error,
    };
  } else {
    formattedError = {
      timestamp,
      message: String(error),
      type: 'unknown',
      status: 500,
      context,
    };
  }

  // Visual/console logging
  console.error(
    `[AWS-CLOUD-CLUB-TELEMETRY] [${timestamp}] [Context: ${context}] [Type: ${formattedError.type}]`,
    formattedError
  );

  // Future Telemetry Hook:
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   Sentry.captureException(error, {
  //     tags: { context, type: formattedError.type, status: String(formattedError.status) },
  //     extra: formattedError
  //   });
  // }
}
