import React from "react";
import type { GameSnapshot } from "../types";
import { artifactCost, calculatePrestigeGems, getGemMultiplier } from "../logic";
import { fmt } from "../utils";
import { ARTIFACT_DEFS } from "../prestige";
import type { ArtifactDef } from "../prestige";
import { PRESTIGE_RANK_DAMAGE_BONUS, PRESTIGE_RANK_CRIT_MULT_BONUS } from "../config";

interface PrestigePanelProps {
  game: GameSnapshot;
  derived: GameSnapshot;
  onPrestige: () => void;
  onBuyArtifact: (def: ArtifactDef) => void;
}

export function PrestigePanel({ game, derived, onPrestige, onBuyArtifact }: PrestigePanelProps) {
  const potentialGems = calculatePrestigeGems(derived.totalEarned);

  return (
    <div className="order-3 lg:order-3 w-full md:w-1/2 lg:w-72 bg-slate-900/90 backdrop-blur-sm border-l border-slate-800 flex flex-col shadow-xl h-96 lg:h-auto">
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <h2 className="font-bold text-slate-200 flex items-center gap-2">
          <span>🔮</span> Prestige
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">{derived.prestigeGems}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Prestige Gems</div>
          <div className="mt-2 text-xs text-purple-300">
            Bonus: +{Math.round((getGemMultiplier(derived.prestigeGems, derived.artifacts?.["gem_polish"] || 0) - 1) * 100)}% Loot & Damage
          </div>
        </div>

        {game.totalPrestiges > 0 && (
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Rank Bonus (Rank {game.totalPrestiges})</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-red-300">
                Damage: +{Math.round(game.totalPrestiges * PRESTIGE_RANK_DAMAGE_BONUS * 100)}%
              </div>
              <div className="text-yellow-300">
                Crit Mult: +{fmt(game.totalPrestiges * PRESTIGE_RANK_CRIT_MULT_BONUS)}x
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-2 text-center">Prestige to reset progress and gain Gems based on lifetime earnings.</div>
          <div className="text-center mb-3">
            <span className="text-xs text-slate-500">Potential Gems:</span>
            <div className="text-xl font-bold text-white">{potentialGems}</div>
          </div>
          <button
            onClick={onPrestige}
            disabled={potentialGems <= 0}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded font-bold transition-colors shadow-lg shadow-purple-900/20"
          >
            Prestige Now
          </button>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-slate-300 text-sm mb-2 flex items-center gap-2">
            <span>🏺</span> Artifacts
          </h3>
          <div className="space-y-2">
            {ARTIFACT_DEFS.map(def => {
              const level = game.artifacts?.[def.id] || 0;
              const cost = artifactCost(def, level);
              const canAfford = game.prestigeGems >= cost;
              return (
                <button
                  key={def.id}
                  disabled={!canAfford}
                  onClick={() => onBuyArtifact(def)}
                  className={`w-full p-2 rounded border text-left transition-all ${canAfford
                    ? "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-purple-500/50"
                    : "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200 text-sm">{def.name}</span>
                    <span className="text-xs font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">Lvl {level}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 my-1 leading-tight">{def.description}</div>
                  <div className={`text-xs font-mono font-medium ${canAfford ? "text-purple-400" : "text-red-400"}`}>
                    🔮 {fmt(cost)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
