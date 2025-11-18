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

    // TODO: you can send logs to backend here
    // sendErrorToServer({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl bg-red-50 border border-red-300 shadow">
          <h2 className="text-xl font-semibold text-red-600">
            Something went wrong 😕
          </h2>
          <p className="mt-2 text-gray-700">
            An unexpected error occurred. Please try again.
          </p>

          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Try Again
          </button>

          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 overflow-auto bg-gray-800 text-gray-100 p-4 rounded-lg">
              {this.state.error?.toString()}
              {"\n"}
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
