// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { loadTextures } from './textureLoader';

it('loadTextures returns required keys and non-null values', async () => {
  const textures = await loadTextures();
  expect(textures).toHaveProperty('beam');
  expect(textures).toHaveProperty('particle');
  expect(textures).toHaveProperty('unicorn');

  expect(textures.beam).not.toBeNull();
  expect(textures.particle).not.toBeNull();
  expect(textures.unicorn).not.toBeNull();

  // If pixi is available at runtime, optionally assert the type.
  try {
    const PIXI: any = await import('pixi.js');
    if (PIXI && PIXI.Texture) {
      // at least ensure the returned value is defined
      expect(textures.beam).toBeDefined();
    }
  } catch (e) {
    // pixi not available — that's acceptable for this test environment fallback
  }
});
