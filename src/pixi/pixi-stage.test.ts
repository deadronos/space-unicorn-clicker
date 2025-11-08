// @vitest-environment jsdom
import React from 'react';
import { expect, test } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import PixiStage from './PixiStage';

test('PixiStage mounts a canvas and exposes imperative methods', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = React.createRef<any>();

  await act(async () => {
    root.render(React.createElement(PixiStage, { ref }));
    await new Promise((r) => setTimeout(r, 50));
  });

  const canvas = container.querySelector('canvas');
  expect(canvas).toBeTruthy();
  expect(ref.current).toBeDefined();
  expect(typeof ref.current.spawnBeam).toBe('function');
  expect(typeof ref.current.spawnImpact).toBe('function');

  expect(() => ref.current.spawnBeam({})).not.toThrow();
  expect(() => ref.current.spawnImpact({})).not.toThrow();

  await act(async () => {
    root.unmount();
    await new Promise((r) => setTimeout(r, 10));
  });
});
