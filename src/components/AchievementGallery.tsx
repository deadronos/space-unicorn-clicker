import React, { useState } from "react";
import { ACHIEVEMENT_DEFS } from "../achievements";
import type { GameSnapshot } from "../types";
import { fmt } from "../utils";
import { RippleButton } from "./RippleButton";

interface AchievementGalleryProps {
    game: GameSnapshot;
    onClose: () => void;
}

export function AchievementGallery({ game, onClose }: AchievementGalleryProps) {
    const [activeTab, setActiveTab] = useState<'achievements' | 'stats'>('achievements');

    const unlockedIds = new Set(game.achievements);
    const unlockedCount = unlockedIds.size;
    const totalCount = ACHIEVEMENT_DEFS.length;
    const progress = Math.floor((unlockedCount / totalCount) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Legacy & Statistics
                    </h2>
                    <RippleButton onClick={onClose} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                        ✕
                    </RippleButton>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'achievements'
                                ? 'bg-slate-800 text-yellow-400 border-b-2 border-yellow-400'
                                : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                    >
                        Achievements ({unlockedCount}/{totalCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'stats'
                                ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                                : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                    >
                        Statistics
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === 'achievements' && (
                        <div className="space-y-3">
                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Completion</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                {ACHIEVEMENT_DEFS.map(ach => {
                                    const isUnlocked = unlockedIds.has(ach.id);
                                    return (
                                        <div
                                            key={ach.id}
                                            className={`p-3 rounded-lg border flex items-center gap-4 transition-all ${isUnlocked
                                                    ? 'bg-slate-800/80 border-yellow-500/30 shadow-lg shadow-yellow-900/10'
                                                    : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale'
                                                }`}
                                        >
                                            <div className={`text-2xl ${isUnlocked ? '' : 'opacity-30'}`}>
                                                {ach.id.includes('combo') ? '🔥' : '🏆'}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-bold ${isUnlocked ? 'text-yellow-100' : 'text-slate-500'}`}>
                                                    {ach.name}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {ach.description}
                                                </div>
                                            </div>
                                            {isUnlocked && (
                                                <div className="text-yellow-400/20">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StatItem label="Total Stardust Earned" value={fmt(game.stats.totalStardust)} icon="✨" />
                                <StatItem label="Total Clicks" value={game.stats.totalClicks.toLocaleString()} icon="🖱️" />
                                <StatItem label="Highest Zone Reached" value={game.stats.highestZone.toString()} icon="🌌" />
                                <StatItem label="Highest Combo" value={`${game.stats.highestCombo}x`} icon="🔥" />
                                <StatItem label="Prestige Count" value={game.totalPrestiges.toLocaleString()} icon="🔄" />
                                <StatItem label="Unicorns Recruited" value={game.stats.totalUnicorns.toLocaleString()} icon="🦄" />
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Current Run</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <StatItem label="Current Stardust" value={fmt(game.stardust)} />
                                    <StatItem label="Current Zone" value={game.zone.toString()} />
                                    <StatItem label="Ship Level" value={game.ship.level.toString()} />
                                    <StatItem label="Current Combo" value={`${game.comboCount}x`} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon?: string }) {
    return (
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 flex items-center justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-2">
                {icon && <span>{icon}</span>}
                {label}
            </span>
            <span className="text-white font-mono font-bold">{value}</span>
        </div>
    );
}
