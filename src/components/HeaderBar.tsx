import React, { useRef, useCallback } from "react";
import { 
  Trophy, 
  Download, 
  Upload, 
  Zap, 
  Target, 
  Sparkles,
  MousePointer2,
  Rocket
} from "lucide-react";
import type { GameSnapshot } from "../types";
import { fmt, cn } from "../utils";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface HeaderBarProps {
  game: GameSnapshot;
  derived: GameSnapshot;
  onImport: (state: GameSnapshot) => void;
  onOpenGallery: () => void;
  className?: string;
}

export function HeaderBar({ game, derived, onImport, onOpenGallery, className }: HeaderBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(game));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "space_unicorn_save.json");
    document.body.appendChild(downloadAnchorNode);
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
    event.target.value = '';
  }, [onImport]);

  const comboActive = (derived as any).comboActive;
  const momentumBonus = Math.round(((derived as any).comboDpsMult - 1) * 100);

  return (
    <header className={cn(
      "p-4 flex flex-col md:flex-row justify-between items-center bg-background/80 backdrop-blur-md border-b gap-4",
      className
    )}>
      <div className="flex items-center gap-4">
        <Rocket className="w-8 h-8 text-primary animate-pulse" />
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm leading-tight">
            Space Unicorn Clicker
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span>Zone {derived.zone}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Level {derived.ship.level}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2 md:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-2xl font-black tracking-tight">{fmt(derived.stardust)}</span>
            <span className="text-sm font-medium text-muted-foreground">STARDUST</span>
          </div>
          {derived.passiveStardustPerSecond && derived.passiveStardustPerSecond > 0 ? (
            <div className="text-xs font-bold text-purple-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              +{fmt(derived.passiveStardustPerSecond)}/s
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden xl:flex flex-col items-end text-sm">
          <div className="flex items-center gap-4 font-semibold">
            <div className="flex items-center gap-1.5 text-orange-400">
              <Target className="w-4 h-4" />
              <span>DPS: {fmt(derived.dps)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <MousePointer2 className="w-4 h-4" />
              <span>Click: {fmt(derived.clickDamage)}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            {derived.critChance > 0 && (
              <span>Crit: {Math.round(derived.critChance * 100)}% (x{derived.critMult.toFixed(1)})</span>
            )}
            {comboActive && (
              <span className="text-teal-400 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-teal-400" />
                Momentum: +{momentumBonus}%
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenGallery} className="gap-2 font-bold text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Legacy</span>
          </Button>
          
          <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleExport} title="Export Save">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleImportClick} title="Import Save">
              <Upload className="w-4 h-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
