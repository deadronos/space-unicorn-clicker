import React from "react";
import { fmt } from "../utils";

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
    compact = false
}: ItemCardProps) {
    if (compact) {
        return (
            <button
                key={id}
                disabled={!canAfford}
                onClick={onClick}
                className={`w-full p-2 rounded border text-left transition-all ${canAfford
                    ? "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-purple-500/50"
                    : "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                    }`}
            >
                <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200 text-sm">{name}</span>
                    <span className="text-xs font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">Lvl {level}</span>
                </div>
                <div className="text-[10px] text-slate-400 my-1 leading-tight">{description}</div>
                <div className={`text-xs font-mono font-medium ${canAfford ? "text-purple-400" : "text-red-400"}`}>
                    {currencyIcon} {fmt(cost)}
                </div>
            </button>
        );
    }

    return (
        <button
            key={id}
            disabled={!canAfford}
            onClick={onClick}
            className={`w-full p-3 rounded-lg text-left transition-all duration-200 border ${canAfford
                ? "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] active:scale-[0.98]"
                : "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                }`}
        >
            <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-200">{name}</span>
                <span className="text-xs font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">Lvl {level}</span>
            </div>
            <div className="text-xs text-slate-400 mb-2">{description}</div>
            <div className={`text-sm font-mono font-medium ${canAfford ? "text-purple-400" : "text-red-400"}`}>
                {currencyIcon} {fmt(cost)}
            </div>
        </button>
    );
}
