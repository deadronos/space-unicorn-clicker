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
