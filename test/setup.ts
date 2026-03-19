import '@testing-library/jest-dom';

// Try to use `canvas` (node-canvas) if available; otherwise provide a small stub
// Provide a small stub for 2D contexts used by tests (avoid requiring node-canvas at test runtime)
try {
  if (typeof (HTMLCanvasElement as any) !== 'undefined' && !(HTMLCanvasElement.prototype as any).getContext) {
    (HTMLCanvasElement.prototype as any).getContext = function (type: string) {
      if (type === '2d') {
        return {
          save: () => {},
          restore: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fill: () => {},
          arc: () => {},
          clearRect: () => {},
          fillRect: () => {},
          measureText: (t: any) => ({ width: 0 }),
          createLinearGradient: () => ({ addColorStop: () => {} }),
        } as any;
      }
      return null;
    };
  }
} catch (e) {
  // ignore environments without HTMLCanvasElement
}

// Some environments (e.g., jsdom 29 with certain configs) may provide a partial
// `localStorage` implementation lacking `.clear()`. Tests in this repo rely on
// `localStorage.clear()` to reset state between runs, so ensure it's available.
if (typeof (globalThis as any).localStorage !== 'undefined') {
  const storage = (globalThis as any).localStorage;
  if (typeof storage.clear !== 'function') {
    const backing = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (key: string) => {
        const value = backing.get(key);
        return value === undefined ? null : value;
      },
      setItem: (key: string, value: string) => {
        backing.set(key, String(value));
      },
      removeItem: (key: string) => {
        backing.delete(key);
      },
      clear: () => {
        backing.clear();
      },
      key: (index: number) => {
        return Array.from(backing.keys())[index] ?? null;
      },
      get length() {
        return backing.size;
      },
    } as any;
  }
}

// Enable React's act() environment
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
