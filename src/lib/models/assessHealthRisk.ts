import type { OilQuality, RiskLevel } from '@/lib/types';
import { DAILY_LIMIT_GRAMS, DAILY_SAFE_GRAMS } from '@/lib/constants';

/**
 * MODEL 2 — Health Risk Assessment
 * Replaces: Decision Tree (from the original Python/Flask ML design).
 *
 * Implemented as a literal nested if/else decision tree to preserve the
 * interpretability of a real decision-tree model — each branch can be traced
 * and explained, which is the core advantage of decision trees for health
 * applications.
 *
 * Inputs:
 *  - oilQuality: output from Model 1 (Fresh / Moderate / Degraded)
 *  - dailyGrams: total oil consumed today in grams
 *  - fryingFrequency: how often the user deep-fries
 *  - reusePractice: oil reuse behavior
 *  - age, bmi, activityLevel, preExistingConditions: from user profile
 *
 * Output: 'Low' | 'Medium' | 'High'
 */

export interface HealthRiskInput {
  oilQuality: OilQuality;
  dailyGrams: number;
  fryingFrequency: string;
  reusePractice: string;
  age: number;
  bmi: number;
  activityLevel: string;
  preExistingConditions: string[];
}

export interface HealthRiskResult {
  risk: RiskLevel;
  reasons: string[];
}

export function assessHealthRisk(input: HealthRiskInput): HealthRiskResult {
  const {
    oilQuality, dailyGrams, fryingFrequency, reusePractice,
    age, bmi, activityLevel, preExistingConditions,
  } = input;

  const reasons: string[] = [];
  const hasCondition = preExistingConditions.length > 0;
  const overLimit = dailyGrams > DAILY_LIMIT_GRAMS;
  const overSafe = dailyGrams > DAILY_SAFE_GRAMS;
  const frequentFrying =
    fryingFrequency === 'Daily' || fryingFrequency === '3-4 times a week';
  const heavyReuse =
    reusePractice === 'Reuses 2-3 times' ||
    reusePractice === 'Reuses more than 3 times';
  const highBmi = bmi >= 25;
  const older = age >= 45;
  const lowActivity = activityLevel === 'Low';

  // --- Decision Tree (nested if/else, mirroring a trained tree's splits) ---

  if (oilQuality === 'Degraded') {
    // Degraded oil is the most dangerous signal
    if (hasCondition || (highBmi && older)) {
      reasons.push('Degraded oil combined with existing risk factors');
      return { risk: 'High', reasons };
    }
    if (lowActivity || heavyReuse) {
      reasons.push('Degraded oil with low activity or heavy reuse');
      return { risk: 'High', reasons };
    }
    reasons.push('Oil quality degraded — reduce reuse');
    return { risk: 'Medium', reasons };
  }

  if (oilQuality === 'Moderate') {
    if (overLimit && frequentFrying) {
      reasons.push('Moderate oil quality, exceeding daily limit with frequent frying');
      return { risk: 'High', reasons };
    }
    if (overSafe || heavyReuse || hasCondition) {
      reasons.push('Moderate oil quality with elevated intake or conditions');
      return { risk: 'Medium', reasons };
    }
    reasons.push('Oil quality moderate but within safe range');
    return { risk: 'Low', reasons };
  }

  // oilQuality === 'Fresh'
  if (overLimit) {
    if (hasCondition || older) {
      reasons.push('Fresh oil but exceeding daily limit with risk factors');
      return { risk: 'High', reasons };
    }
    reasons.push('Fresh oil but daily intake exceeds 25g limit');
    return { risk: 'Medium', reasons };
  }

  if (overSafe && frequentFrying) {
    reasons.push('Intake above safe threshold with frequent frying');
    return { risk: 'Medium', reasons };
  }

  if (hasCondition && overSafe) {
    reasons.push('Pre-existing conditions with above-safe intake');
    return { risk: 'Medium', reasons };
  }

  reasons.push('Oil fresh and intake within safe range');
  return { risk: 'Low', reasons };
}
