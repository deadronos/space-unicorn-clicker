
import * as PIXI from 'pixi.js';
// Expose PIXI on the global object so legacy code that checks `globalThis.PIXI`
// (and tests that rely on a global PIXI) can detect and use the real PIXI runtime.
;(globalThis as any).PIXI = PIXI;

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
