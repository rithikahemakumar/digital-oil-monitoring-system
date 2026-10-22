import { supabase } from '@/lib/supabase';
import { classifyOilQuality } from './classifyOilQuality';
import { assessHealthRisk } from './assessHealthRisk';
import { generateRecommendation } from './generateRecommendation';
import { DAILY_LIMIT_GRAMS } from '@/lib/constants';
import { sendSystemNotification } from '@/lib/notifications';
import type { OilLog, Profile, DailySummary, AlertSeverity } from '@/lib/types';

/**
 * AI PIPELINE — Wires Model 1 → Model 2 → Model 3 in sequence.
 *
 * Flow: logIntake() → classifyOilQuality() → assessHealthRisk() →
 *       generateRecommendation() → upsert daily_summaries + insert alerts
 *
 * This replaces the Python/Flask ML service from the original design.
 * All scoring is done client-side in TypeScript because Bolt's browser
 * runtime cannot execute Python.
 */

export interface PipelineInput {
  profile: Profile;
  logs: OilLog[];
  todayLogs: OilLog[];
  latestLog: OilLog;
  fryingFrequency: string;
}

export interface PipelineResult {
  quality: string;
  risk: string;
  recommendation: { message: string; action: string; severity: AlertSeverity };
  totalGrams: number;
}

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
  const { profile, todayLogs, latestLog, fryingFrequency } = input;

  // Calculate today's total grams
  const totalGrams = todayLogs.reduce((sum, log) => sum + Number(log.quantity_grams), 0);

  // MODEL 1: Oil Quality Classification
  const usageCycles = todayLogs.filter(l => l.oil_type === latestLog.oil_type).length;
  const qualityResult = classifyOilQuality({
    reusePractice: latestLog.reuse_practice || 'Never reuses',
    usageCycles,
    oilType: latestLog.oil_type,
    freshness: latestLog.freshness || 'fresh',
  });

  // MODEL 2: Health Risk Assessment
  const riskResult = assessHealthRisk({
    oilQuality: qualityResult.quality,
    dailyGrams: totalGrams,
    fryingFrequency,
    reusePractice: latestLog.reuse_practice || 'Never reuses',
    age: profile.age,
    bmi: Number(profile.bmi),
    activityLevel: profile.activity_level,
    preExistingConditions: profile.pre_existing_conditions || [],
  });

  // MODEL 3: Behavioral Recommendation
  const trend = calculateTrend(input.logs, totalGrams);
  const recommendation = generateRecommendation({
    risk: riskResult.risk,
    trend,
    oilType: latestLog.oil_type,
    dailyGrams: totalGrams,
  });

  // Persist: upsert daily summary & alert
  const today = latestLog.log_date;
  const isDemo = typeof window !== 'undefined' && localStorage.getItem('oilwise_demo') === 'true';

  if (isDemo) {
    try {
      const demoAlert: Alert = {
        id: 'alert-' + Date.now(),
        user_id: profile.user_id,
        message: `${recommendation.message} ${recommendation.action}`,
        severity: recommendation.severity,
        read: false,
        created_at: new Date().toISOString(),
      };
      const prevAlerts = JSON.parse(localStorage.getItem('oilwise_demo_alerts') || '[]');
      localStorage.setItem('oilwise_demo_alerts', JSON.stringify([demoAlert, ...prevAlerts]));
    } catch (e) {
      console.error('Demo alert storage error:', e);
    }
  } else {
    try {
      await supabase
        .from('daily_summaries')
        .upsert({
          user_id: profile.user_id,
          log_date: today,
          total_grams: totalGrams,
          quality_class: qualityResult.quality,
          risk_level: riskResult.risk,
          updated_at: new Date().toISOString(),
        });

      await supabase.from('alerts').insert({
        user_id: profile.user_id,
        message: `${recommendation.message} ${recommendation.action}`,
        severity: recommendation.severity,
      });
    } catch (e) {
      console.error('Database write error:', e);
    }
  }

  // Fire system/browser push notification
  const alertIcon = recommendation.severity === 'critical' ? '🚨' : recommendation.severity === 'warning' ? '⚠️' : '✅';
  sendSystemNotification(`${alertIcon} OilWise Health Alert`, {
    body: `${recommendation.message} ${recommendation.action}`,
    tag: `oil-alert-${Date.now()}`,
  });

  return {
    quality: qualityResult.quality,
    risk: riskResult.risk,
    recommendation,
    totalGrams,
  };
}

function calculateTrend(logs: OilLog[], todayGrams: number): 'rising' | 'falling' | 'stable' {
  // Group logs by date for the last 7 days
  const byDate = new Map<string, number>();
  for (const log of logs) {
    const current = byDate.get(log.log_date) || 0;
    byDate.set(log.log_date, current + Number(log.quantity_grams));
  }

  const dates = Array.from(byDate.keys()).sort();
  if (dates.length < 2) return 'stable';

  // Compare last 3 days average vs previous 3 days average
  const recent = dates.slice(-3);
  const previous = dates.slice(-6, -3);

  const recentAvg = recent.length > 0
    ? recent.reduce((s, d) => s + (byDate.get(d) || 0), 0) / recent.length
    : 0;
  const prevAvg = previous.length > 0
    ? previous.reduce((s, d) => s + (byDate.get(d) || 0), 0) / previous.length
    : 0;

  if (prevAvg === 0) return recentAvg > DAILY_LIMIT_GRAMS ? 'rising' : 'stable';

  const change = (recentAvg - prevAvg) / prevAvg;
  if (change > 0.1) return 'rising';
  if (change < -0.1) return 'falling';
  return 'stable';
}
