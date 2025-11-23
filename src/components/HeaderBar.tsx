import React, { useRef, useCallback } from "react";
import type { GameSnapshot } from "../types";
import { fmt } from "../utils";

interface HeaderBarProps {
  game: GameSnapshot;
  derived: GameSnapshot;
  onImport: (state: GameSnapshot) => void;
}

export function HeaderBar({ game, derived, onImport }: HeaderBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(game));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "space_unicorn_save.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [game]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation
        if (json && typeof json.stardust === 'number' && json.ship) {
          onImport(json);
        } else {
          alert("Invalid save file format");
        }
      } catch (error) {
        console.error("Failed to parse save file", error);
        alert("Failed to parse save file");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = '';
  }, [onImport]);

  return (
    <header className="p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div>
        <h1 className="text-2xl font-bold bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
          Space Unicorn Clicker
        </h1>
        <div className="text-xs text-slate-400 font-mono mt-1">
          Zone {derived.zone} • Level {derived.ship.level}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Export Save
          </button>
          <button
            onClick={handleImportClick}
            className="px-3 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Import Save
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".json"
          />
        </div>

        <div className="text-right">
          <div className="text-lg">
            Stardust: <span className="font-bold">{fmt(derived.stardust)}</span>
          </div>
          <div className="text-sm text-slate-300">
            DPS: {derived.dps.toFixed(1)} • Click: {derived.clickDamage.toFixed(1)} {derived.critChance > 0 ? `• Crit ${Math.round(derived.critChance * 100)}% x${derived.critMult.toFixed(1)}` : ""}
          </div>
          <div className="text-sm text-slate-400">Total Earned: {fmt(derived.totalEarned)}</div>
          <div className="text-xs text-purple-400 mt-1">
            🦄 Unicorns: {derived.unicornCount} {derived.comboCount > 1 ? `• Combo: ${derived.comboCount}x` : ""}
          </div>
        </div>
      </div>
    </header>
  );
}
