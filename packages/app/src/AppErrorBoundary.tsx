import React, { Component, ReactNode } from 'react';

type State = { error: Error | null; stack: string };

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null, stack: '' };
  }
  componentDidCatch(error: Error, info: { componentStack: string }) {
    this.setState({ error, stack: info.componentStack });
    console.error(error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Render error</h2>
          <div>{this.state.error.message}</div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
