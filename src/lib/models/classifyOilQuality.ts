import { OIL_VOLATILITY } from '@/lib/constants';
import type { OilQuality } from '@/lib/types';

/**
 * MODEL 1 — Oil Quality Classifier
 * Replaces: Logistic Regression (from the original Python/Flask ML design).
 *
 * Why TypeScript instead of scikit-learn: Bolt's browser runtime cannot execute
 * Python. This pure-TS function replicates the logistic-regression decision
 * boundary using a weighted-sum score passed through the sigmoid function
 * 1 / (1 + e^-x). The weights are heuristic/rule-derived; they can later be
 * swapped for coefficients trained offline in scikit-learn and exported as JSON.
 *
 * Inputs:
 *  - reusePractice: how many times the oil has been reused
 *  - usageCycles: estimated number of heating cycles the oil has undergone
 *  - oilType: the type of oil (determines volatility/smoke-point factor)
 *  - freshness: user-entered sensory check (fresh / slightly off / rancid)
 *
 * Output: 'Fresh' | 'Moderate' | 'Degraded'
 */

const REUSE_WEIGHTS: Record<string, number> = {
  'Never reuses': 0,
  'Reuses once': 1,
  'Reuses 2-3 times': 2.5,
  'Reuses more than 3 times': 4,
};

const FRESHNESS_WEIGHTS: Record<string, number> = {
  fresh: 0,
  'slightly off': 2,
  rancid: 4,
};

export interface OilQualityInput {
  reusePractice: string;
  usageCycles: number;
  oilType: string;
  freshness: string;
}

export interface OilQualityResult {
  quality: OilQuality;
  degradationProbability: number;
  score: number;
}

export function classifyOilQuality(input: OilQualityInput): OilQualityResult {
  const reuseScore = REUSE_WEIGHTS[input.reusePractice] ?? 0;
  const cycleScore = Math.min(input.usageCycles, 5) * 0.8;
  const volatility = OIL_VOLATILITY[input.oilType] ?? 0.5;
  const freshnessScore = FRESHNESS_WEIGHTS[input.freshness] ?? 0;

  // Weighted linear combination — mimics logistic-regression feature weights
  const rawScore =
    reuseScore * 0.9 +
    cycleScore * 0.6 +
    volatility * 3.0 +
    freshnessScore * 1.2 -
    4.0; // bias term

  // Sigmoid activation — same as logistic regression's decision function
  const probability = 1 / (1 + Math.exp(-rawScore));

  let quality: OilQuality;
  if (probability > 0.7) quality = 'Degraded';
  else if (probability > 0.35) quality = 'Moderate';
  else quality = 'Fresh';

  return { quality, degradationProbability: probability, score: rawScore };
}
