// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { createPixiApp } from './usePixiApp';

it('createPixiApp attaches a canvas view to container', async () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const app: any = await createPixiApp(div);

  expect(app).toBeTruthy();
  expect((app.canvas ?? app.view)).toBeTruthy();
  expect(div.contains((app.canvas ?? app.view))).toBe(true);

  try {
    app.ticker.autoStart = false;
    app.ticker.stop?.();
  } catch (e) {
    // ignore
  }

  app.destroy?.();
});
