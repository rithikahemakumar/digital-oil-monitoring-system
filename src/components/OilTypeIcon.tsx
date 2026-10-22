import { OIL_COLORS } from '@/lib/constants';

const OIL_ICONS: Record<string, { emoji: string; label: string }> = {
  'Mustard': { emoji: '🟡', label: 'Mustard' },
  'Sunflower': { emoji: '🌻', label: 'Sunflower' },
  'Kachi Ghani': { emoji: '🫗', label: 'Kachi Ghani' },
  'Refined (blend)': { emoji: '🛢️', label: 'Refined' },
  'Coconut': { emoji: '🥥', label: 'Coconut' },
  'Soybean': { emoji: '🌱', label: 'Soybean' },
  'Groundnut': { emoji: '🥜', label: 'Groundnut' },
  'Palm': { emoji: '🌴', label: 'Palm' },
};

export function OilTypeIcon({ type, size = 40 }: { type: string; size?: number }) {
  const icon = OIL_ICONS[type] || { emoji: '🛢️', label: type };
  const color = OIL_COLORS[type] || '#94A3B8';
  return (
    <div
      className="flex items-center justify-center rounded-2xl shrink-0"
      style={{
        width: size, height: size,
        backgroundColor: `${color}20`,
        fontSize: size * 0.45,
      }}
    >
      {icon.emoji}
    </div>
  );
}
