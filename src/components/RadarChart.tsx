import React from 'react';
import { CoreStatKey, StatInfo } from '../types';

interface RadarChartProps {
  stats: Record<CoreStatKey, StatInfo>;
  maxLevelReference?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ stats, maxLevelReference = 25 }) => {
  const statKeys: CoreStatKey[] = ['VIT', 'END', 'FOC', 'INT', 'MEN', 'FIN', 'SOC'];
  const labels: Record<CoreStatKey, { name: string; tag: string; color: string }> = {
    VIT: { name: '신체/근력', tag: 'VIT', color: 'text-red-400' },
    END: { name: '지구력', tag: 'END', color: 'text-orange-400' },
    FOC: { name: '몰입/집중', tag: 'FOC', color: 'text-amber-400' },
    INT: { name: '지능/학습', tag: 'INT', color: 'text-blue-400' },
    MEN: { name: '멘탈/회복', tag: 'MEN', color: 'text-purple-400' },
    FIN: { name: '금융/자산', tag: 'FIN', color: 'text-green-400' },
    SOC: { name: '소통/관계', tag: 'SOC', color: 'text-indigo-400' },
  };

  const size = 260;
  const center = size / 2;
  const radius = size * 0.36;
  const totalSides = statKeys.length;

  const getStatNormalized = (stat?: StatInfo) => {
    const level = Math.max(1, stat?.level || 1);
    const levelExp = Math.max(0, stat?.currentExp || 0);
    const nextLevelExp = Math.max(1, stat?.nextLevelExp || 1);
    const levelProgress = Math.min(1, levelExp / nextLevelExp);
    const fractionalLevel = level - 1 + levelProgress;

    // Keep a small visible base shape for a new user while allowing every EXP gain
    // to move the radar before the next integer level is reached. The easing curve
    // makes early growth visible instead of hiding it inside a 25-level scale.
    const progressRatio = Math.min(1, fractionalLevel / Math.max(1, maxLevelReference - 1));
    return Math.min(1, Math.max(0.1, 0.1 + Math.pow(progressRatio, 0.55) * 0.9));
  };

  // Calculate polygon points for grid rings
  const getPolygonPoints = (scale: number) => {
    return statKeys
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / totalSides - Math.PI / 2;
        const x = center + radius * scale * Math.cos(angle);
        const y = center + radius * scale * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Calculate polygon points for current stats
  const statPoints = statKeys
    .map((key, i) => {
      const stat = stats[key];
      const normalized = getStatNormalized(stat);
      const angle = (Math.PI * 2 * i) / totalSides - Math.PI / 2;
      const x = center + radius * normalized * Math.cos(angle);
      const y = center + radius * normalized * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px] aspect-square overflow-visible select-none drop-shadow-[0_0_12px_rgba(249,115,22,0.25)]"
      >
        {/* Background Grids */}
        {[0.25, 0.5, 0.75, 1.0].map((scale, idx) => (
          <polygon
            key={idx}
            points={getPolygonPoints(scale)}
            fill={idx === 3 ? 'rgba(255, 255, 255, 0.02)' : 'none'}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray={idx < 3 ? '2 2' : 'none'}
          />
        ))}

        {/* Axis Lines */}
        {statKeys.map((_, i) => {
          const angle = (Math.PI * 2 * i) / totalSides - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Dynamic Stat Polygon with Immersive Glow */}
        <defs>
          <radialGradient id="statAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#EA580C" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.1" />
          </radialGradient>
        </defs>

          <polygon
            points={statPoints}
            fill="url(#statAura)"
            stroke="#F97316"
            strokeWidth="2"
            className="transition-[points] duration-700 ease-out"
          />

        {/* Vertex Points */}
        {statKeys.map((key, i) => {
          const stat = stats[key];
          const normalized = getStatNormalized(stat);
          const angle = (Math.PI * 2 * i) / totalSides - Math.PI / 2;
          const x = center + radius * normalized * Math.cos(angle);
          const y = center + radius * normalized * Math.sin(angle);

          return (
            <circle
              key={key}
              cx={x}
              cy={y}
              r="3.5"
              className="fill-orange-400 stroke-black stroke-2 transition-all duration-700 ease-out shadow-sm"
            />
          );
        })}

        {/* Labels with tags and levels */}
        {statKeys.map((key, i) => {
          const stat = stats[key];
          const angle = (Math.PI * 2 * i) / totalSides - Math.PI / 2;
          const labelDist = radius + 25;
          const x = center + labelDist * Math.cos(angle);
          const y = center + labelDist * Math.sin(angle);

          return (
            <g key={key} transform={`translate(${x}, ${y})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[9px] font-bold fill-slate-400 uppercase tracking-wider"
              >
                {labels[key].tag}
              </text>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                y="11"
                className="text-[8.5px] font-mono font-bold fill-orange-400"
              >
                Lv.{stat?.level || 1}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-center mt-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
          Core Attributes Radar (Max Lv.{maxLevelReference})
        </span>
      </div>
    </div>
  );
};
