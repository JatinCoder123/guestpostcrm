import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });

    // TODO: send logs to backend
    // sendErrorToServer({ error, errorInfo });
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
          <div className="w-full rounded-2xl bg-white shadow-xl border border-gray-200 p-8 text-center">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <span className="text-3xl">⚠️</span>
            </div>

            {/* Title */}
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              Something went wrong
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm text-gray-600">
              An unexpected error occurred. Please refresh the page or try again
              later.
            </p>

            {/* Action */}
            <button
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              Reload Page
            </button>

            {/* Dev-only error details */}
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-6 max-h-48 overflow-auto rounded-xl bg-gray-900 p-4 text-left text-xs text-red-300">
                {this.state.error?.toString()}
                {"\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
