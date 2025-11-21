import React from "react";
import { BEAM_COLORS } from "../config";

export function BeamVisual({
    crit,
    unicornIndex = 0,
    startX,
    startY,
}: {
    crit: boolean;
    unicornIndex?: number;
    startX: number;
    startY: number;
}) {

    const colorScheme = BEAM_COLORS[unicornIndex % BEAM_COLORS.length];
    const uniqueId = `${unicornIndex}-${Date.now()}-${Math.random()}`;
    const duration = crit ? 700 : 600;
    const endX = 85;
    const endY = 50;

    const BeamLine = ({ stroke, strokeWidth, strokeOpacity, animation }: { stroke: string; strokeWidth: number; strokeOpacity?: number; animation: string }) => (
        <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
            filter={strokeOpacity ? `url(#glow-${uniqueId})` : undefined}
            style={{ opacity: 0, animation }}
        />
    );

    return (
        <svg className="absolute inset-0 pointer-events-none z-50" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`beamGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colorScheme.start} stopOpacity="1" />
                    <stop offset="50%" stopColor={colorScheme.mid} stopOpacity="1" />
                    <stop offset="100%" stopColor={colorScheme.end} stopOpacity="1" />
                </linearGradient>
                <filter id={`glow-${uniqueId}`} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <BeamLine
                stroke={colorScheme.mid}
                strokeWidth={crit ? 12 : 10}
                strokeOpacity={0.4}
                animation={`beamFade ${duration}ms cubic-bezier(.1,.5,.1,1) forwards`}
            />
            <BeamLine
                stroke={`url(#beamGrad-${uniqueId})`}
                strokeWidth={crit ? 6 : 5}
                strokeOpacity={1}
                animation={`beamFade ${duration}ms cubic-bezier(.1,.5,.1,1) forwards`}
            />
            <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#ffffff"
                strokeWidth={crit ? 3 : 2.5}
                style={{ opacity: 0, animation: `beamFade ${duration}ms ease-out forwards` }}
            />
            <circle
                cx={startX}
                cy={startY}
                r={crit ? 4 : 3}
                fill={colorScheme.start}
                filter={`url(#glow-${uniqueId})`}
                style={{ opacity: .95, animation: `impactFlash ${duration}ms ease-out forwards` }}
            />
        </svg>
    );
}

export function ImpactSparks({ duration }: { duration: number }) {
    const dots = new Array(8).fill(0).map((_, i) => ({ angle: (i / 8) * Math.PI * 2, dist: 8 + (i % 3) * 4 }));
    return (
        <svg className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" width="64" height="64" viewBox="0 0 64 64">
            {dots.map((d, i) => (
                <circle key={i} cx={48} cy={32} r={1.4} fill="#a5b4fc" style={{ transformOrigin: "48px 32px", transform: `translate(0,0)`, animation: `spark${i} ${Math.max(200, duration - 120)}ms ease-out forwards`, filter: "drop-shadow(0 0 6px rgba(99,102,241,.9))" }} />
            ))}
            <style>{dots.map((d, i) => `@keyframes spark${i}{0%{transform:translate(0,0);opacity:1}100%{transform:translate(${Math.cos(d.angle) * d.dist}px,${Math.sin(d.angle) * d.dist}px);opacity:0}}`).join("\n")}</style>
        </svg>
    );
}

export function ShieldGeneratorVisual({ x, y, hp, maxHp }: { x: number; y: number; hp: number; maxHp: number }) {
    const healthPct = (hp / maxHp) * 100;
    const isDestroyed = hp <= 0;

    if (isDestroyed) return null;

    return (
        <div
            className="absolute w-8 h-8 -ml-4 -mt-4 z-20 cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `${x}%`, top: `${y}%` }}
            title={`Shield Generator: ${Math.ceil(hp)}/${maxHp}`}
        >
            <div className="w-full h-full rounded-full bg-cyan-900 border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-cyan-400 transition-all duration-300" style={{ height: `${healthPct}%`, opacity: 0.5 }} />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-cyan-100 pointer-events-none">
                    ⚡
                </div>
            </div>
        </div>
    );
}

export function ShieldBubble({ active }: { active: boolean }) {
    if (!active) return null;
    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-[60%] h-[60%] rounded-full border-2 border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-[pulse_3s_ease-in-out_infinite] backdrop-blur-[1px]">
                <div className="absolute inset-0 rounded-full border border-cyan-300/30 animate-[spin_10s_linear_infinite]" />
            </div>
        </div>
    );
}

export function BattleshipVisual({ shake, variant, isBoss }: { shake: boolean; variant: 'standard' | 'armored' | 'speed'; isBoss: boolean }) {
    const hullColor = isBoss ? '#dc2626' : variant === 'armored' ? '#1e293b' : variant === 'speed' ? '#334155' : '#0b1220';
    const hullColor2 = isBoss ? '#991b1b' : variant === 'armored' ? '#0f172a' : variant === 'speed' ? '#1e293b' : '#334155';
    const accentColor = isBoss ? '#fbbf24' : variant === 'armored' ? '#475569' : variant === 'speed' ? '#60a5fa' : '#64748b';

    return (
        <svg className={`w-full h-full ${shake ? 'animate-[shake_220ms_ease-out]' : ''}`} viewBox="0 0 160 80">
            <defs>
                <linearGradient id={`hull-${variant}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={hullColor} />
                    <stop offset="100%" stopColor={hullColor2} />
                </linearGradient>
                <radialGradient id={`engine-${variant}`} cx="0.1" cy="0.5" r="0.8">
                    <stop offset="0%" stopColor={variant === 'speed' ? '#60a5fa' : '#93c5fd'} stopOpacity="1" />
                    <stop offset="100%" stopColor={variant === 'speed' ? '#60a5fa' : '#93c5fd'} stopOpacity="0" />
                </radialGradient>
            </defs>
            <path d="M10 50 L70 30 L150 40 L100 60 L20 60 Z" fill={`url(#hull-${variant})`} stroke={accentColor} strokeWidth={isBoss ? "2.5" : "1.5"} />
            {variant === 'armored' && (
                <>
                    <rect x="60" y="35" width="30" height="20" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" opacity="0.8" />
                    <rect x="90" y="38" width="25" height="15" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" opacity="0.8" />
                </>
            )}
            <rect x="70" y="24" width={variant === 'speed' ? "12" : "16"} height="10" rx="2" fill="#1f2937" stroke="#94a3b8" />
            {new Array(variant === 'speed' ? 3 : 5).fill(0).map((_, i) => (<rect key={i} x={78 + i * 8} y={44} width="3" height="2" fill="#cbd5e1" opacity={0.8 - i * 0.1} />))}
            <circle cx="18" cy="55" r={variant === 'speed' ? "12" : "10"} fill={`url(#engine-${variant})`} />
            <circle cx="18" cy="55" r={variant === 'speed' ? "3" : "2.5"} fill="#e2e8f0" />
            {isBoss && (
                <>
                    <rect x="75" y="18" width="8" height="6" fill="#fbbf24" opacity="0.8" />
                    <rect x="88" y="18" width="8" height="6" fill="#fbbf24" opacity="0.8" />
                </>
            )}
            <line x1="86" y1="24" x2="90" y2="16" stroke="#94a3b8" strokeWidth="1" />
            <line x1="90" y1="24" x2="95" y2="18" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    );
}
