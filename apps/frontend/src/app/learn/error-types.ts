export type LearningErrorType =
  | 'network'
  | 'server'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'unknown';

export class LearningPageError extends Error {
  type: LearningErrorType;
  status: number;

  constructor(message: string, type: LearningErrorType, status: number) {
    super(message);
    this.name = 'LearningPageError';
    this.type = type;
    this.status = status;
  }
}

export function categorizeError(err: any): LearningPageError {
  if (err instanceof LearningPageError) {
    return err;
  }

  // 1. Check if user is offline or if it's a browser network error
  const isOffline = typeof window !== 'undefined' && !window.navigator.onLine;
  const isNetworkError =
    err?.code === 'ERR_NETWORK' ||
    err?.message?.toLowerCase().includes('network') ||
    err?.message?.toLowerCase().includes('load failed');

  if (isOffline || isNetworkError) {
    return new LearningPageError(
      err?.message || 'We could not connect to the learning service.',
      'network',
      0
    );
  }

  // 2. Check for request timeouts
  const isTimeout =
    err?.code === 'ECONNABORTED' ||
    err?.status === 408 ||
    err?.message?.toLowerCase().includes('timeout') ||
    err?.message?.toLowerCase().includes('exceeded');

  if (isTimeout) {
    return new LearningPageError(
      err?.message || 'The request timed out. Please try again.',
      'timeout',
      err?.status || 408
    );
  }

  // 3. Check for specific status codes
  const status = err?.status || err?.response?.status;
  if (status === 401) {
    return new LearningPageError(
      err?.message || 'Your session has expired. Please sign in again.',
      'unauthorized',
      401
    );
  }

  if (status === 403) {
    return new LearningPageError(
      err?.message || "You don't have permission to access this learning resource.",
      'forbidden',
      403
    );
  }

  if (status === 404) {
    return new LearningPageError(
      err?.message || "The requested learning resource could not be found.",
      'unknown',
      404
    );
  }

  if (status >= 500) {
    return new LearningPageError(
      err?.message || 'The learning service is temporarily unavailable.',
      'server',
      status
    );
  }

  // 4. Default to unknown application error
  return new LearningPageError(
    err?.message || 'An unexpected error occurred while loading content.',
    'unknown',
    status || 500
  );
}
