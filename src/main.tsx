import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    const msg = error?.message || '';
    // If the error was caused by a browser extension (e.g. MetaMask, web3 injection), do not crash
    if (
      msg.toLowerCase().includes('metamask') ||
      msg.toLowerCase().includes('ethereum') ||
      msg.toLowerCase().includes('chrome-extension')
    ) {
      return { hasError: false, errorMessage: '' };
    }
    return { hasError: true, errorMessage: msg };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if error is extension-related
    const isExtension =
      error?.stack?.includes('chrome-extension://') ||
      error?.message?.toLowerCase().includes('metamask') ||
      error?.message?.toLowerCase().includes('ethereum');

    if (!isExtension) {
      console.error('App Uncaught Error:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050807] text-[#e0e6e3] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-2xl font-mono mb-4">
            !
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            An unexpected error occurred while rendering the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold text-sm transition-all"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);

