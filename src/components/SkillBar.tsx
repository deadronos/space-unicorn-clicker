import React from 'react';
import { GameSnapshot } from '../types';
import { SKILL_DEFS } from '../skills';
import { RippleButton } from './RippleButton';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '../utils';

interface SkillBarProps {
    game: GameSnapshot;
    onActivate: (skillId: string) => void;
}

export function SkillBar({ game, onActivate }: SkillBarProps) {
    if (!game.skills) return null;

    return (
        <div className="flex justify-center gap-6 p-2">
            {SKILL_DEFS.map(def => {
                const state = game.skills[def.id] || { cooldownRemaining: 0, activeRemaining: 0 };
                const isOnCooldown = state.cooldownRemaining > 0;
                const isActive = state.activeRemaining > 0;
                const progress = isOnCooldown
                    ? (state.cooldownRemaining / def.cooldown) * 100
                    : 0;

                return (
                    <Tooltip key={def.id}>
                        <TooltipTrigger asChild>
                            <div className="relative group select-none">
                                <RippleButton
                                    onClick={() => onActivate(def.id)}
                                    disabled={isOnCooldown || isActive}
                                    className={cn(
                                        "w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all shadow-md overflow-hidden",
                                        isActive
                                            ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110 animate-pulse ring-2 ring-primary ring-offset-2 ring-offset-background'
                                            : isOnCooldown
                                                ? 'bg-muted border-muted opacity-50 cursor-not-allowed grayscale'
                                                : 'bg-secondary hover:bg-secondary/80 border-primary/20 hover:border-primary/50 hover:shadow-lg active:scale-95'
                                    )}
                                >
                                    <span className={cn(isActive ? "animate-bounce" : "")}>{def.icon}</span>
                                </RippleButton>

                                {/* Cooldown Overlay */}
                                {isOnCooldown && (
                                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-background/80 transition-all duration-100 ease-linear"
                                            style={{ height: `${progress}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-foreground text-xs drop-shadow-sm">
                                            {Math.ceil(state.cooldownRemaining / 1000)}s
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="flex flex-col items-center gap-1 p-3">
                            <div className="font-black uppercase tracking-widest text-primary text-xs">{def.name}</div>
                            <div className="text-[10px] text-muted-foreground text-center leading-tight max-w-[150px] italic">
                                "{def.description}"
                            </div>
                            <div className="text-[9px] font-bold mt-1 bg-secondary px-2 py-0.5 rounded-full border border-primary/20 uppercase">
                                Cooldown: {def.cooldown / 1000}s
                            </div>
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </div>
    );
}
