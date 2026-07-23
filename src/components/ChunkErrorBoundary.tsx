'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

export default class ChunkErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Only auto-retry for chunk load errors
    if (
      error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module')
    ) {
      if (this.state.retryCount < 3) {
        setTimeout(() => {
          this.setState((prev) => ({
            hasError: false,
            retryCount: prev.retryCount + 1,
          }));
        }, 1500 * (this.state.retryCount + 1));
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.retryCount < 3) {
        return (
          <div className="flex items-center justify-center h-32 rounded-xl bg-muted/40 border border-border animate-pulse">
            <span className="text-xs text-muted-foreground">Loading…</span>
          </div>
        );
      }
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-32 rounded-xl bg-muted/40 border border-border gap-2">
            <span className="text-xs text-muted-foreground">Failed to load component.</span>
            <button
              className="text-xs text-primary underline"
              onClick={() => this.setState({ hasError: false, retryCount: 0 })}
            >
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
