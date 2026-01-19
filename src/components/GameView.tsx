import React, { MutableRefObject, RefObject } from "react";
import { Skull, Heart, Shield } from "lucide-react";
import type { GameSnapshot, BeamState } from "../types";
import { UNICORN_CARD_LAYOUT, UNICORN_IMG } from "../config";
import { RippleButton } from "./RippleButton";
import { BattleshipVisual, ShieldGeneratorVisual, ShieldBubble } from "./Visuals";
import { fmt, cn } from "../utils";
import { Progress } from "./ui/progress";

interface GameViewProps {
  game: GameSnapshot;
  derived: GameSnapshot;
  beams: BeamState[];
  clickZoneRef: RefObject<HTMLButtonElement | null>;
  unicornRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  onAttack: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
}

export function GameView({ game, derived, beams, clickZoneRef, unicornRefs, onAttack }: GameViewProps) {
  const hpPercent = (derived.ship.hp / derived.ship.maxHp) * 100;
  
  return (
    <div className="w-full h-full relative overflow-hidden bg-background/20 backdrop-blur-[2px] flex flex-col items-center justify-center perspective-1000">
      {/* Background Decor / Stars */}
      <div className="absolute inset-0 z-[-1] opacity-20 bg-[url('/stars.png')] bg-repeat" />

      {/* Unicorns */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {UNICORN_CARD_LAYOUT.slice(0, game.unicornCount).map((pos, i) => (
          <div
            key={i}
            ref={el => { if (el) unicornRefs.current[i] = el; }}
            className="absolute w-24 h-36 bg-secondary/80 backdrop-blur-sm border rounded-xl shadow-2xl flex items-center justify-center transition-all duration-700 hover:scale-105 active:scale-95"
            style={{
              left: `${pos.left}%`,
              bottom: `${pos.bottom}%`,
              transform: `rotate(${pos.rotate}deg)`,
              opacity: 0.9
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/10 rounded-xl" />
            <img src={UNICORN_IMG} className="w-full h-full p-4 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" alt="Unicorn" />
          </div>
        ))}
      </div>

      <RippleButton
        ref={clickZoneRef}
        title="Click to fire your horn laser!"
        className="relative w-full max-w-2xl aspect-video outline-none group cursor-crosshair z-10"
        onClick={onAttack}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-32 relative transition-transform duration-75 active:scale-[0.97] group-hover:scale-[1.02]">
            <BattleshipVisual shake={false} variant={derived.ship.variant} isBoss={derived.ship.isBoss} />
            <ShieldBubble active={derived.ship.generators?.some(g => g.hp > 0) ?? false} />
            {derived.ship.generators?.map(gen => (
              <ShieldGeneratorVisual key={gen.id} x={gen.x} y={gen.y} hp={gen.hp} maxHp={gen.maxHp} />
            ))}
          </div>
        </div>
      </RippleButton>

      {/* Health / Status UI */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-20 space-y-4">
        {derived.ship.isBoss ? (
          <div className="bg-background/60 backdrop-blur-md p-4 rounded-2xl border-2 border-destructive/50 shadow-2xl space-y-3">
             <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <Skull className="w-5 h-5 text-destructive animate-bounce" />
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive/80">Omega Entity Detected</div>
                        <h2 className="text-lg font-black tracking-tighter uppercase leading-none">Apex Predator</h2>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-black font-mono text-destructive">{fmt(derived.ship.hp)}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{Math.ceil(hpPercent)}% HP</div>
                </div>
             </div>
             <Progress value={hpPercent} className="h-3 bg-destructive/10" />
          </div>
        ) : (
          <div className="bg-background/40 backdrop-blur-sm p-3 rounded-xl border shadow-xl flex flex-col items-center gap-2 w-72 mx-auto">
             <div className="flex w-full justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> Integrity</span>
                <span className="font-mono text-primary">{Math.ceil(hpPercent)}%</span>
             </div>
             <Progress value={hpPercent} className="h-1.5" />
             <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                Zone {derived.zone} • Sentinel Tier {Math.floor(derived.ship.level)}
             </div>
          </div>
        )}
      </div>

      {/* Floating Damage Text Container (Handled by beams but visual hook) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {/* Beams are handled by logic, but we can add some overall FX here if needed */}
      </div>
    </div>
  );
}
