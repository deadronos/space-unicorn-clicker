
import { Companion } from './Companion';

export class CompanionPool {
  private readonly _pool: Companion[] = [];
  private readonly _active: Set<Companion> = new Set();

  get anies(): Companion[] {
    return Array.from(this._active.values());
  }

  get(opts?: { onFinish?: () => void; app?: any; pixiOpts?: any }): Companion {
    let companion: Companion | undefined = this._pool.pop();

    if (!companion) {
      companion = new Companion();
    }

    const onFinish = opts?.onFinish;
    const finalOnFinish = () => {
      if (onFinish) {
        try {
          onFinish();
        } catch (e) {
          // ignore
        }
      }
      this._active.delete(companion!);
      companion!.reset();
      this._pool.push(companion!);
    };

    companion.play({ ...opts, onFinish: finalOnFinish });
    this._active.add(companion);
    return companion;
  }
}

export const companionPool = new CompanionPool();
