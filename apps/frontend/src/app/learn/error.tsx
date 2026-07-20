'use client';

import React, { useEffect } from 'react';
import LearningErrorView from '@/components/Learn/LearningErrorView';
import { logError } from './error-logger';
import { categorizeError } from './error-types';

interface ErrorProps {
  error: Error & { digest?: string; type?: string; status?: number };
  reset: () => void;
}

/**
 * Route-level Error Boundary for Next.js App Router.
 * Catches unhandled React runtime errors, parsing failures, and render crashes in the /learn route tree.
 */
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    logError(error, 'nextjs-route-boundary');
  }, [error]);

  // Transform generic error to categorized error format
  const categorized = categorizeError(error);

  return <LearningErrorView error={categorized} reset={reset} />;
}
