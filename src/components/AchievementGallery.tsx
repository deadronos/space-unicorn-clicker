import React from "react";
import { Trophy, BarChart3, Star, Zap, Flame, Target, Infinity, Rocket, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { ACHIEVEMENT_DEFS } from "../achievements";
import type { GameSnapshot } from "../types";
import { fmt, cn } from "../utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface AchievementGalleryProps {
    game: GameSnapshot;
}

export function AchievementGallery({ game }: AchievementGalleryProps) {
    const unlockedIds = new Set(game.achievements);
    const unlockedCount = unlockedIds.size;
    const totalCount = ACHIEVEMENT_DEFS.length;
    const progress = Math.floor((unlockedCount / totalCount) * 100);

    return (
        <div className="h-full flex flex-col overflow-hidden bg-background">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Star className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    Galactic Legacy
                </h2>
            </div>

            <Tabs defaultValue="achievements" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-2">
                    <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                        <TabsTrigger value="achievements" className="font-black uppercase text-[10px] tracking-widest gap-2">
                            <Trophy className="w-3 h-3" /> Hall of Fame
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="font-black uppercase text-[10px] tracking-widest gap-2">
                            <BarChart3 className="w-3 h-3" /> Archive Data
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="achievements" className="flex-1 overflow-hidden flex flex-col px-4 mt-2">
                    <div className="space-y-4 mb-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progression</div>
                                <div className="text-sm font-bold">{unlockedCount} / {totalCount} Decoded</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-primary leading-none">{progress}%</div>
                            </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <ScrollArea className="flex-1 -mx-2 px-2 pb-6">
                        <div className="grid gap-3">
                            {ACHIEVEMENT_DEFS.map(ach => {
                                const isUnlocked = unlockedIds.has(ach.id);
                                const isCombo = ach.id.includes('combo');
                                
                                return (
                                    <div
                                        key={ach.id}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all flex items-center gap-3 relative overflow-hidden group",
                                            isUnlocked
                                                ? 'bg-secondary/40 border-primary/30 shadow-sm'
                                                : 'bg-muted/20 border-border/40 opacity-50 grayscale'
                                        )}
                                    >
                                        {isUnlocked && <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />}
                                        
                                        <div className={cn(
                                            "min-w-[40px] h-10 rounded-lg flex items-center justify-center text-lg shadow-inner",
                                            isUnlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            {isCombo ? <Flame className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                "font-black uppercase text-[10px] tracking-tight truncate",
                                                isUnlocked ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {ach.name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground leading-tight italic line-clamp-2">
                                                "{ach.description}"
                                            </div>
                                        </div>

                                        {isUnlocked && (
                                            <div className="text-primary/40 shrink-0">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="stats" className="flex-1 overflow-hidden px-4 mt-2 pb-6 flex flex-col">
                    <ScrollArea className="flex-1 -mx-2 px-2">
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                                    <Infinity className="w-3 h-3" /> Lifetime Records
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <StatItem label="Stardust" value={fmt(game.stats?.totalStardust ?? 0)} icon={<Star className="w-3 h-3" />} />
                                    <StatItem label="Input Cycles" value={(game.stats?.totalClicks ?? 0).toLocaleString()} icon={<Target className="w-3 h-3" />} />
                                    <StatItem label="Deep Space" value={`Zone ${game.stats?.highestZone ?? 0}`} icon={<Infinity className="w-3 h-3" />} />
                                    <StatItem label="Peak Resonance" value={`${game.stats?.highestCombo ?? 0}x`} icon={<Flame className="w-3 h-3" />} />
                                    <StatItem label="Resurrections" value={(game.totalPrestiges ?? 0).toLocaleString()} icon={<RotateCcw className="w-3 h-3" />} />
                                    <StatItem label="Unicorn Armada" value={(game.stats?.totalUnicorns ?? 0).toLocaleString()} icon={<Rocket className="w-3 h-3" />} />
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> Current Session
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <StatItem label="Local Stardust" value={fmt(game.stardust)} />
                                    <StatItem label="Local Zone" value={game.zone.toString()} />
                                    <StatItem label="Shell Integrity" value={game.ship.level.toString()} />
                                    <StatItem label="Active Combo" value={`${game.comboCount}x`} />
                                </div>
                            </section>
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="bg-secondary/20 p-3 rounded-xl border flex items-center justify-between group hover:bg-secondary/40 transition-colors">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                {icon && <span className="text-primary/60">{icon}</span>}
                {label}
            </span>
            <span className="text-foreground font-black font-mono text-xs">{value}</span>
        </div>
    );
}
