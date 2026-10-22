import { DAILY_LIMIT_GRAMS } from '@/lib/constants';

interface ProgressRingProps {
  grams: number;
  limit?: number;
  size?: number;
}

export function ProgressRing({ grams, limit = DAILY_LIMIT_GRAMS, size = 200 }: ProgressRingProps) {
  const percentage = Math.min(grams / limit, 1.5);
  const clampedPct = Math.min(percentage, 1);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedPct);

  let color = '#22c55e'; // green
  let statusText = 'Safe';
  if (grams > limit) {
    color = '#ef4444';
    statusText = 'Over Limit';
  } else if (grams > 20) {
    color = '#f59e0b';
    statusText = 'Approaching Limit';
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth={12}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-neutral-900">{Math.round(grams)}<span className="text-lg text-neutral-400">g</span></span>
        <span className="text-sm font-medium text-neutral-500 mt-1">of {limit}g limit</span>
        <span className="text-xs font-semibold mt-1 px-3 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
