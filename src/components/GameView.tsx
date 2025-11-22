import React, { MutableRefObject, RefObject } from "react";
import type { GameSnapshot, BeamState } from "../types";
import { UNICORN_CARD_LAYOUT, UNICORN_IMG } from "../config";
import { RippleButton } from "./RippleButton";
import { BattleshipVisual, ShieldGeneratorVisual, ShieldBubble } from "./Visuals";
import { fmt } from "../utils";

interface GameViewProps {
  game: GameSnapshot;
  derived: GameSnapshot;
  beams: BeamState[];
  clickZoneRef: RefObject<HTMLButtonElement | null>;
  unicornRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  onAttack: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
}

export function GameView({ game, derived, beams, clickZoneRef, unicornRefs, onAttack }: GameViewProps) {
  return (
    <div className="order-1 lg:order-2 w-full lg:flex-1 h-[50vh] lg:h-auto relative bg-black/20 flex flex-col items-center justify-center perspective-1000 shrink-0">
      <div className="absolute inset-0 pointer-events-none">
        {UNICORN_CARD_LAYOUT.slice(0, game.unicornCount).map((pos, i) => (
          <div
            key={i}
            ref={el => { if (el) unicornRefs.current[i] = el; }}
            className="absolute w-32 h-48 bg-slate-800/80 border border-slate-600 rounded-lg shadow-lg flex items-center justify-center transition-all duration-500"
            style={{
              left: `${pos.left}%`,
              bottom: `${pos.bottom}%`,
              transform: `rotate(${pos.rotate}deg)`,
              opacity: 0.8
            }}
          >
            <img src={UNICORN_IMG} className="w-full h-full p-2 object-contain drop-shadow-md" alt="Unicorn" />
          </div>
        ))}
      </div>

      <RippleButton
        ref={clickZoneRef}
        title="Click to fire your horn laser!"
        className="relative w-full max-w-2xl aspect-video outline-none group cursor-crosshair"
        onClick={onAttack}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-32 relative transition-transform duration-75 active:scale-95">
            <BattleshipVisual shake={false} variant={derived.ship.variant} isBoss={derived.ship.isBoss} />
            <ShieldBubble active={derived.ship.generators?.some(g => g.hp > 0) ?? false} />
            {derived.ship.generators?.map(gen => (
              <ShieldGeneratorVisual key={gen.id} x={gen.x} y={gen.y} hp={gen.hp} maxHp={gen.maxHp} />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {beams.map(b => (
            <div key={b.id} className="absolute inset-0">
            </div>
          ))}
        </div>
      </RippleButton>

      {derived.ship.isBoss && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 max-w-[90%]">
          <div className="flex justify-between text-xs font-bold text-red-200 mb-1 uppercase tracking-wider">
            <span>Boss Level {derived.ship.level}</span>
            <span>{fmt(derived.ship.hp)} / {fmt(derived.ship.maxHp)} ({Math.ceil((derived.ship.hp / derived.ship.maxHp) * 100)}%)</span>
          </div>
          <div className="h-4 bg-slate-900/80 rounded-full overflow-hidden border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <div
              className="h-full bg-linear-to-r from-red-600 to-red-500 transition-all duration-300 ease-out"
              style={{ width: `${(derived.ship.hp / derived.ship.maxHp) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!derived.ship.isBoss && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 max-w-[80%] opacity-80 hover:opacity-100 transition-opacity">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
              style={{ width: `${(derived.ship.hp / derived.ship.maxHp) * 100}%` }}
            />
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-1 font-mono">
            HP: {fmt(derived.ship.hp)} / {fmt(derived.ship.maxHp)}
          </div>
        </div>
      )}

    </div>
  );
}
