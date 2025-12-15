import React from 'react';
import { GameSnapshot } from '../types';
import { SKILL_DEFS } from '../skills';
import { RippleButton } from './RippleButton';

interface SkillBarProps {
    game: GameSnapshot;
    onActivate: (skillId: string) => void;
}

export function SkillBar({ game, onActivate }: SkillBarProps) {
    if (!game.skills) return null;

    return (
        <div className="flex justify-center gap-4 p-4 pointer-events-auto">
            {SKILL_DEFS.map(def => {
                const state = game.skills[def.id] || { cooldownRemaining: 0, activeRemaining: 0 };
                const isOnCooldown = state.cooldownRemaining > 0;
                const isActive = state.activeRemaining > 0;
                const progress = isOnCooldown
                    ? (state.cooldownRemaining / def.cooldown) * 100
                    : 0;

                return (
                    <div key={def.id} className="relative group select-none">
                        <RippleButton
                            onClick={() => onActivate(def.id)}
                            disabled={isOnCooldown || isActive}
                            className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-3xl transition-all shadow-lg overflow-hidden
                                ${isActive
                                    ? 'bg-yellow-500/20 border-yellow-400 shadow-yellow-500/50 scale-110 animate-pulse'
                                    : isOnCooldown
                                        ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
                                        : 'bg-slate-800 hover:bg-slate-700 border-cyan-500/50 hover:border-cyan-400 shadow-cyan-900/20 active:scale-95'
                                }
                            `}
                        >
                            {def.icon}
                        </RippleButton>

                        {/* Cooldown Overlay */}
                        {isOnCooldown && (
                            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all duration-100 ease-linear"
                                    style={{ height: `${progress}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm drop-shadow-md">
                                    {Math.ceil(state.cooldownRemaining / 1000)}
                                </div>
                            </div>
                        )}

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-700 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                            <div className="font-bold text-white text-sm">{def.name}</div>
                            <div className="text-xs text-slate-400">{def.description}</div>
                            <div className="text-xs text-slate-500 mt-1">Cooldown: {def.cooldown / 1000}s</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
