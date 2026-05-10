import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <p className="text-4xl">⚠️</p>
        <p className="text-lg font-semibold text-gray-800">Something went wrong</p>
        <p className="text-sm text-gray-500 max-w-sm">
          An unexpected error occurred. Try again or go back to the home page.
        </p>
        <div className="flex gap-3">
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Go home
          </a>
        </div>
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-4 text-xs text-red-400 bg-red-50 border border-red-100 rounded-lg p-3 max-w-lg overflow-auto text-left">
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
