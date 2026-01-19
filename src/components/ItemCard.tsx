import React from "react";
import { fmt, cn } from "../utils";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

interface ItemCardProps {
    id: string;
    name: string;
    level: number;
    description: string;
    cost: number;
    canAfford: boolean;
    currencyIcon: React.ReactNode;
    onClick: () => void;
    compact?: boolean;
    progress?: number;
}

export function ItemCard({
    id,
    name,
    level,
    description,
    cost,
    canAfford,
    currencyIcon,
    onClick,
    compact = false,
    progress
}: ItemCardProps) {
    const affordabilityProgress = Math.min(1, progress ?? 0);

    return (
        <button
            type="button"
            className={cn(
                "rounded-xl border bg-card text-card-foreground shadow w-full text-left",
                "group cursor-pointer transition-all duration-200 overflow-hidden relative",
                canAfford 
                    ? "hover:border-primary/50 hover:bg-accent/50 active:scale-[0.98]" 
                    : "opacity-60 grayscale-[0.5] cursor-not-allowed"
            )}
            onClick={onClick}
            disabled={!canAfford}
        >
            <CardContent className={cn("p-3", compact ? "space-y-1" : "space-y-2")}>
                <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                        <h3 className={cn("font-bold transition-colors group-hover:text-primary", compact ? "text-sm" : "text-base")}>
                            {name}
                        </h3>
                        {description && !compact && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                                "{description}"
                            </p>
                        )}
                    </div>
                    <div className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Lvl {level}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className={cn(
                        "font-mono font-bold flex items-center gap-1.5",
                        canAfford ? "text-primary" : "text-destructive"
                    )}>
                        <span className="text-muted-foreground">{currencyIcon}</span>
                        <span className={compact ? "text-xs" : "text-sm"}>{fmt(cost)}</span>
                    </div>
                    {progress !== undefined && !canAfford && (
                        <div className="flex-1 max-w-[80px]">
                            <Progress value={affordabilityProgress * 100} className="h-1" />
                        </div>
                    )}
                </div>
            </CardContent>
            
            {/* Selection indicator or highlights could go here */}
            {canAfford && (
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </button>
    );
}
