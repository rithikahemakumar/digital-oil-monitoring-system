export const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Bihar', 'West Bengal',
  'Madhya Pradesh', 'Telangana', 'Punjab', 'Haryana', 'Andhra Pradesh',
  'Assam', 'Kerala', 'Rajasthan', 'Uttar Pradesh', 'Odisha', 'Gujarat',
] as const;

export const STATE_TO_ZONE: Record<string, string> = {
  'Maharashtra': 'West', 'Delhi': 'North', 'Karnataka': 'South', 'Tamil Nadu': 'South',
  'Bihar': 'East', 'West Bengal': 'East', 'Madhya Pradesh': 'Central',
  'Telangana': 'South', 'Punjab': 'North', 'Haryana': 'North',
  'Andhra Pradesh': 'South', 'Assam': 'East', 'Kerala': 'South',
  'Rajasthan': 'North', 'Uttar Pradesh': 'North', 'Odisha': 'East', 'Gujarat': 'West',
};

export const ZONES = ['North', 'South', 'East', 'West', 'Central'] as const;

export const RESIDENCE_TYPES = ['Urban', 'Rural'] as const;

export const OIL_TYPES = [
  'Mustard', 'Sunflower', 'Kachi Ghani', 'Refined (blend)',
  'Coconut', 'Soybean', 'Groundnut', 'Palm',
] as const;

export const FRYING_FREQUENCIES = [
  'Rarely/Never', 'Occasionally (monthly)', '1-2 times a week',
  '3-4 times a week', 'Daily',
] as const;

export const REUSE_PRACTICES = [
  'Never reuses', 'Reuses once', 'Reuses 2-3 times', 'Reuses more than 3 times',
] as const;

export const BRAND_PREFERENCES = [
  'Price-driven', 'Brand loyalty', 'Health claims (low cholesterol/fortified)',
  'Doctor/dietician recommended', 'Locally pressed/unbranded',
] as const;

export const INCOME_BRACKETS = [
  'Below ₹15,000', '₹15,000–₹30,000', '₹30,000–₹50,000',
  '₹50,000–₹1,00,000', 'Above ₹1,00,000',
] as const;

export const ACTIVITY_LEVELS = ['Low', 'Moderate', 'High'] as const;

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const;

export const COOKING_METHODS = [
  'Deep frying', 'Shallow frying', 'Saute', 'Tempering (Tadka)', 'Raw/Cold', 'Baking/Roasting',
] as const;

export const FRESHNESS_OPTIONS = ['fresh', 'slightly off', 'rancid'] as const;

export const DAILY_LIMIT_GRAMS = 25;
export const DAILY_SAFE_GRAMS = 20;

export const OIL_VOLATILITY: Record<string, number> = {
  'Mustard': 0.3,
  'Sunflower': 0.7,
  'Kachi Ghani': 0.2,
  'Refined (blend)': 0.6,
  'Coconut': 0.25,
  'Soybean': 0.65,
  'Groundnut': 0.5,
  'Palm': 0.55,
};

export const OIL_COLORS: Record<string, string> = {
  'Mustard': '#E5B80B',
  'Sunflower': '#F59E0B',
  'Kachi Ghani': '#84CC16',
  'Refined (blend)': '#94A3B8',
  'Coconut': '#FDE68A',
  'Soybean': '#A3E635',
  'Groundnut': '#D97706',
  'Palm': '#EA580C',
};
