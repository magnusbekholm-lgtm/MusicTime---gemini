import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center space-y-6">
          <h1 className="text-4xl font-black italic text-red-500 uppercase">Something went wrong</h1>
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 max-w-2xl w-full text-left overflow-auto">
            <p className="text-zinc-400 font-mono text-xs mb-4 uppercase tracking-widest">Error Details</p>
            <pre className="text-red-400 text-sm whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black font-black px-8 py-4 rounded-xl hover:scale-105 transition-all"
          >
            RELOAD APPLICATION
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
