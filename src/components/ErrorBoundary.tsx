
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-destructive animate-pulse" />
          <h1 className="text-3xl font-black uppercase tracking-tight">System Failure</h1>
          <p className="max-w-md text-muted-foreground">
            A critical error has occurred in the main interface. The application logic may still be running.
          </p>
          <div className="bg-muted p-4 rounded text-left font-mono text-xs overflow-auto max-w-full w-full border border-destructive/20 text-destructive">
            {this.state.error?.toString()}
          </div>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
