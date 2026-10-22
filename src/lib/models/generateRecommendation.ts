import type { RiskLevel, AlertSeverity } from '@/lib/types';

/**
 * MODEL 3 — Behavioral Recommendation Engine
 * Replaces: Rule-Based Expert System (from the original design).
 *
 * A rules table mapping (risk level + 7-day trend) combinations to specific,
 * actionable advice strings. This is the rule-based expert system — each rule
 * is a row in the recommendation table, making the logic transparent and
 * extensible.
 *
 * Inputs:
 *  - risk: output from Model 2 (Low / Medium / High)
 *  - trend: 7-day intake trend ('rising' | 'falling' | 'stable')
 *  - oilType: the user's most-used oil type (for targeted advice)
 *  - dailyGrams: today's total intake
 *
 * Output: { message, action, severity } — written to the alerts table.
 */

export interface RecommendationInput {
  risk: RiskLevel;
  trend: 'rising' | 'falling' | 'stable';
  oilType: string;
  dailyGrams: number;
}

export interface RecommendationResult {
  message: string;
  action: string;
  severity: AlertSeverity;
}

interface Rule {
  risk: RiskLevel;
  trend: 'rising' | 'falling' | 'stable';
  message: string;
  action: string;
  severity: AlertSeverity;
}

const RULES: Rule[] = [
  // High risk
  { risk: 'High', trend: 'rising', message: 'Your oil intake is high and rising. Immediate action needed.', action: 'Stop deep-frying for 48 hours. Switch to steaming or air-frying. Use Mustard or Kachi Ghani oil in small quantities.', severity: 'critical' },
  { risk: 'High', trend: 'stable', message: 'Your oil intake remains dangerously high.', action: 'Reduce oil to 15g/day for the next week. Avoid reusing oil entirely. Consult a doctor if you have pre-existing conditions.', severity: 'critical' },
  { risk: 'High', trend: 'falling', message: 'Your intake is high but improving — keep going!', action: 'Continue reducing. Aim for under 20g/day. Try Olive or Mustard oil as a healthier alternative.', severity: 'warning' },

  // Medium risk
  { risk: 'Medium', trend: 'rising', message: 'Your oil intake is approaching unsafe levels.', action: 'Cut back on fried foods this week. Use less oil for tempering. Consider Sunflower or Soybean oil.', severity: 'warning' },
  { risk: 'Medium', trend: 'stable', message: 'Your oil intake is moderate but could be healthier.', action: 'Try reducing portion sizes of fried items. Switch to shallow frying instead of deep frying.', severity: 'warning' },
  { risk: 'Medium', trend: 'falling', message: 'Good progress — your intake is trending down from moderate.', action: 'Keep it up! Stay under 25g/day and avoid reusing oil more than once.', severity: 'info' },

  // Low risk
  { risk: 'Low', trend: 'rising', message: 'Your intake is within safe range but creeping up.', action: 'Monitor portion sizes. You are doing well — stay below 20g/day for best results.', severity: 'info' },
  { risk: 'Low', trend: 'stable', message: 'Excellent! Your oil intake is consistently within the safe zone.', action: 'Maintain your current habits. Your oil choice and cooking methods are healthy.', severity: 'info' },
  { risk: 'Low', trend: 'falling', message: 'Great work — your oil intake is dropping to very healthy levels.', action: 'You are a role model for smart oil use. Keep sharing your healthy cooking practices!', severity: 'info' },
];

export function generateRecommendation(input: RecommendationInput): RecommendationResult {
  const rule = RULES.find(r => r.risk === input.risk && r.trend === input.trend);

  if (!rule) {
    return {
      message: 'Keep tracking your daily oil intake to receive personalized advice.',
      action: 'Log your meals regularly for better insights.',
      severity: 'info',
    };
  }

  // Personalize with oil type if relevant
  let message = rule.message;
  let action = rule.action;

  if (input.oilType === 'Palm' && input.risk !== 'Low') {
    action += ' Consider switching from Palm oil to Mustard or Groundnut oil for better health profile.';
  }
  if (input.oilType === 'Refined (blend)' && input.risk === 'High') {
    action += ' Refined blends lose natural nutrients — try cold-pressed Kachi Ghani oils instead.';
  }

  return { message, action, severity: rule.severity };
}
