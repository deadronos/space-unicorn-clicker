// Minimal texture loader with safe fallbacks for test environments
export async function loadTextures(): Promise<Record<string, import('pixi.js').Texture>> {
  try {
    const PIXI: any = await import('pixi.js');

    const makeFallbackTexture = (): any => {
      try {
        if (PIXI.Texture && (PIXI.Texture as any).WHITE) return (PIXI.Texture as any).WHITE;
        if (typeof document !== 'undefined' && document.createElement) {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          if ((PIXI.Texture as any).from) return (PIXI.Texture as any).from(canvas);
        }
      } catch (e) {
        // ignore and fall through to null
      }
      return null;
    };

    const fallback = makeFallbackTexture();
    const tex = (fallback ?? (PIXI.Texture ? (PIXI.Texture as any).WHITE ?? (PIXI.Texture as any) : null)) as import('pixi.js').Texture;

    return {
      beam: tex,
      particle: tex,
      unicorn: tex,
    };
  } catch (err) {
    // pixi not available or failed — return safe plain objects as fallbacks
    const fake: any = {};
    return { beam: fake, particle: fake, unicorn: fake } as Record<string, import('pixi.js').Texture>;
  }
}
