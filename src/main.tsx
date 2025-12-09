import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Error Boundary: 捕获渲染错误，防止白屏
interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black text-red-500 font-mono p-8 z-50 overflow-auto">
          <h1 className="text-4xl border-b border-red-500 pb-2 mb-4">SYSTEM FATAL ERROR</h1>
          <div className="bg-red-900/20 p-4 border border-red-800 mb-4">
             <pre className="whitespace-pre-wrap text-sm">{this.state.error?.toString()}</pre>
          </div>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-black font-bold uppercase hover:bg-red-500">
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="color:red;padding:20px">FATAL: Root element not found in index.html</div>';
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}