export type OilQuality = 'Fresh' | 'Moderate' | 'Degraded';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bmi: number;
  activity_level: string;
  pre_existing_conditions: string[];
  household_size: number;
  state: string;
  zone: string;
  created_at: string;
}

export interface OilLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: string;
  oil_type: string;
  quantity_grams: number;
  cooking_method: string;
  reuse_practice: string | null;
  freshness: string | null;
  created_at: string;
}

export interface DailySummary {
  user_id: string;
  log_date: string;
  total_grams: number;
  quality_class: string | null;
  risk_level: string | null;
  updated_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  message: string;
  severity: AlertSeverity;
  read: boolean;
  created_at: string;
}

export interface SurveyBenchmark {
  respondent_id: string;
  state: string;
  zone: string;
  residence_type: string;
  household_size: number;
  monthly_household_income: string;
  primary_oil_type: string;
  monthly_oil_purchase_litres: number;
  deep_frying_frequency: string;
  oil_reuse_practice: string;
  health_awareness_score_1_10: number;
  brand_price_preference: string;
}
