import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center gap-6">
          <div className="bg-red-50 border border-red-200 rounded-full p-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
            <p className="text-slate-500 text-pretty">
              An unexpected error occurred. Our team has been notified. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">Error details</summary>
                <pre className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-3 overflow-x-auto whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            <Button onClick={() => { this.handleReset(); window.location.href = '/'; }} className="gap-2">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
