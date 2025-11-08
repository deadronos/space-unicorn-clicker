// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { createPixiApp } from './usePixiApp';

it('createPixiApp attaches a canvas view to container', () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const app: any = createPixiApp(div);

  expect(app).toBeTruthy();
  expect(app.view).toBeTruthy();
  expect(div.contains(app.view)).toBe(true);

  try {
    app.ticker.autoStart = false;
    app.ticker.stop?.();
  } catch (e) {
    // ignore
  }

  app.destroy?.();
});
