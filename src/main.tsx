
import * as PIXI from 'pixi.js';
// Expose PIXI on the global object so legacy code that checks `globalThis.PIXI`
// (and tests that rely on a global PIXI) can detect and use the real PIXI runtime.
;(globalThis as any).PIXI = PIXI;

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
