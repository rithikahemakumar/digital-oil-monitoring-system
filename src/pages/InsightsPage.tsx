import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Users,
  Calendar,
  Layers,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Info,
  Download,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/Card';
import { OilTypeIcon } from '@/components/OilTypeIcon';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { OIL_COLORS, STATES, ZONES, DAILY_LIMIT_GRAMS, DAILY_SAFE_GRAMS } from '@/lib/constants';
import type { DailySummary, OilLog, SurveyBenchmark } from '@/lib/types';

export function InsightsPage() {
  const { profile } = useAuth();
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [logs, setLogs] = useState<OilLog[]>([]);
  const [benchmarks, setBenchmarks] = useState<SurveyBenchmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Comparison view mode: 'day' | 'week'
  const [comparisonMode, setComparisonMode] = useState<'day' | 'week'>('day');

  // Selected state for regional benchmark comparison (defaults to user's profile state)
  const [selectedState, setSelectedState] = useState<string>('');

  useEffect(() => {
    if (profile) {
      if (!selectedState) {
        setSelectedState(profile.state || 'Maharashtra');
      }
      loadAllData();
    }
  }, [profile]);

  function getDemoLogs(): OilLog[] {
    const raw = localStorage.getItem('oilwise_demo_logs');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return [];
  }

  async function loadAllData() {
    const isDemo = localStorage.getItem('oilwise_demo') === 'true';

    try {
      // 1. Fetch benchmarks
      const benchmarkRes = await supabase
        .from('survey_benchmarks')
        .select('*');
      const allBenchmarks = (benchmarkRes.data as SurveyBenchmark[]) || [];
      setBenchmarks(allBenchmarks);

      // 2. Fetch user summaries and logs
      if (isDemo) {
        const demoLogs = getDemoLogs();
        setLogs(demoLogs);

        // Generate synthetic summaries from demo logs if needed
        const dates = Array.from(new Set(demoLogs.map(l => l.log_date))).sort();
        const demoSummaries: DailySummary[] = dates.map(d => {
          const dayL = demoLogs.filter(l => l.log_date === d);
          const total = dayL.reduce((sum, item) => sum + Number(item.quantity_grams), 0);
          return {
            user_id: profile!.user_id,
            log_date: d,
            total_grams: total,
            quality_class: 'Fresh',
            risk_level: total > 25 ? 'High' : total > 20 ? 'Medium' : 'Low',
            updated_at: new Date().toISOString(),
          };
        });
        setSummaries(demoSummaries);
      } else {
        const [summaryResult, logResult] = await Promise.all([
          supabase
            .from('daily_summaries')
            .select('*')
            .eq('user_id', profile!.user_id)
            .order('log_date', { ascending: true })
            .limit(60),
          supabase
            .from('oil_logs')
            .select('*')
            .eq('user_id', profile!.user_id)
            .order('log_date', { ascending: true })
            .limit(300),
        ]);
        setSummaries((summaryResult.data as DailySummary[]) || []);
        setLogs((logResult.data as OilLog[]) || []);
      }
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setLoading(false);
    }
  }

  // User's average intake calculations
  const totalUserLoggedGrams = logs.reduce((sum, log) => sum + Number(log.quantity_grams), 0);
  const distinctDaysLogged = Math.max(new Set(logs.map(log => log.log_date)).size, summaries.length, 1);
  const userDailyAvg = Math.round(totalUserLoggedGrams / distinctDaysLogged) || 18; // default to safe intake if 0
  const userWeeklyPace = Math.round(userDailyAvg * 7);

  // Regional benchmark calculations based on selectedState or national pool
  const filteredBenchmarks = useMemo(() => {
    if (!selectedState || selectedState === 'All India') return benchmarks;
    return benchmarks.filter(b => b.state.toLowerCase() === selectedState.toLowerCase());
  }, [benchmarks, selectedState]);

  const activeBenchmarkPool = filteredBenchmarks.length > 0 ? filteredBenchmarks : benchmarks;

  // Regional metrics (grams per person per day & week)
  const regionalMetrics = useMemo(() => {
    if (!activeBenchmarkPool.length) {
      return { dailyGrams: 42, weeklyGrams: 294, sampleCount: 0 };
    }
    const totalDailyPerPerson = activeBenchmarkPool.reduce((sum, b) => {
      const monthlyLitres = Number(b.monthly_oil_purchase_litres) || 5;
      const hhSize = Math.max(Number(b.household_size) || 4, 1);
      // Monthly Litres to daily grams per person: (Litres * 920g/L / 30 days) / household_size
      const dailyPerPerson = (monthlyLitres * 920) / (30 * hhSize);
      return sum + dailyPerPerson;
    }, 0);

    const avgDailyGrams = Math.round(totalDailyPerPerson / activeBenchmarkPool.length);
    const avgWeeklyGrams = Math.round(avgDailyGrams * 7);

    return {
      dailyGrams: avgDailyGrams,
      weeklyGrams: avgWeeklyGrams,
      sampleCount: activeBenchmarkPool.length,
    };
  }, [activeBenchmarkPool]);

  // National metrics (across all 1,200 surveyed respondents)
  const nationalMetrics = useMemo(() => {
    if (!benchmarks.length) return { dailyGrams: 44, weeklyGrams: 308 };
    const total = benchmarks.reduce((sum, b) => {
      const monthlyLitres = Number(b.monthly_oil_purchase_litres) || 5;
      const hhSize = Math.max(Number(b.household_size) || 4, 1);
      return sum + (monthlyLitres * 920) / (30 * hhSize);
    }, 0);
    const avg = Math.round(total / benchmarks.length);
    return { dailyGrams: avg, weeklyGrams: avg * 7 };
  }, [benchmarks]);

  // Day-wise comparison data
  const dayComparisonData = [
    { name: 'Your Intake', grams: userDailyAvg, fill: '#16a34a' },
    { name: 'Safe Limit', grams: DAILY_LIMIT_GRAMS, fill: '#059669' },
    { name: `${selectedState || 'Regional'} Avg`, grams: regionalMetrics.dailyGrams, fill: '#f59e0b' },
    { name: 'National Avg', grams: nationalMetrics.dailyGrams, fill: '#64748b' },
  ];

  // Week-wise comparison data
  const weekComparisonData = [
    { name: 'Your Weekly Pace', grams: userWeeklyPace, fill: '#16a34a' },
    { name: 'Safe Limit (7d)', grams: DAILY_LIMIT_GRAMS * 7, fill: '#059669' },
    { name: `${selectedState || 'Regional'} (7d)`, grams: regionalMetrics.weeklyGrams, fill: '#f59e0b' },
    { name: 'National (7d)', grams: nationalMetrics.weeklyGrams, fill: '#64748b' },
  ];

  // Trend data over time
  const trendData = useMemo(() => {
    if (summaries.length) {
      return summaries.slice(-14).map(summary => ({
        date: new Date(`${summary.log_date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        grams: Number(summary.total_grams),
        limit: DAILY_LIMIT_GRAMS,
        regionalDaily: regionalMetrics.dailyGrams,
      }));
    }
    return [];
  }, [summaries, regionalMetrics.dailyGrams]);

  // Oil type breakdown
  const oilData = useMemo(() => {
    const totals = new Map<string, number>();
    logs.forEach(log => totals.set(log.oil_type, (totals.get(log.oil_type) || 0) + Number(log.quantity_grams)));
    return Array.from(totals, ([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
  }, [logs]);

  // Primary oils favored in the selected region (from survey dataset)
  const regionalPopularOils = useMemo(() => {
    const map = new Map<string, number>();
    activeBenchmarkPool.forEach(row => {
      const o = row.primary_oil_type;
      map.set(o, (map.get(o) || 0) + 1);
    });
    return Array.from(map, ([oil, count]) => ({
      oil,
      percentage: Math.round((count / activeBenchmarkPool.length) * 100),
    })).sort((a, b) => b.percentage - a.percentage);
  }, [activeBenchmarkPool]);

  if (loading) {
    return (
      <AppLayout>
        <div className="px-6 pt-8 animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/3" />
          <div className="h-8 bg-neutral-200 rounded w-2/3" />
          <div className="h-48 bg-neutral-200 rounded-2xl" />
          <div className="h-56 bg-neutral-200 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const dayDiffFromRegion = userDailyAvg - regionalMetrics.dailyGrams;
  const weekDiffFromRegion = userWeeklyPace - regionalMetrics.weeklyGrams;

  function handleExportCSV() {
    if (!logs.length) {
      alert('No logged meals to export yet! Log a meal first to generate your report.');
      return;
    }
    const headers = ['Log Date', 'Meal Type', 'Oil Type', 'Quantity (Grams)', 'Cooking Method', 'Reuse Practice', 'Freshness'];
    const rows = logs.map(l => [
      `"${l.log_date}"`,
      `"${l.meal_type}"`,
      `"${l.oil_type}"`,
      l.quantity_grams,
      `"${l.cooking_method || 'N/A'}"`,
      `"${l.reuse_practice || 'N/A'}"`,
      `"${l.freshness || 'N/A'}"`,
    ]);
    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oilwise_monitoring_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppLayout>
      <div className="px-6 pt-6 pb-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
              Digital Platform for Oil Monitoring System
            </span>
            <h1 className="text-2xl font-bold text-neutral-900">Regional Analytics & Insights</h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Compare your cooking oil consumption against ICMR limits and 1,200+ survey households.
            </p>
          </div>

          {/* USER-FRIENDLY FEATURE 4: Download Report */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export your intake history to CSV"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:border-primary-400 text-xs font-semibold text-neutral-700 shadow-xs active:scale-95 transition-all shrink-0 mt-1"
          >
            <Download size={14} className="text-primary-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* REGIONAL BENCHMARK COMPARISON MODULE */}
        <Card className="border-primary-100 shadow-md">
          {/* Card Header & Controls */}
          <div className="border-b border-neutral-100 pb-4 mb-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700">
                  <Users size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-neutral-900 text-sm">Regional Benchmark Comparison</h2>
                  <p className="text-[11px] text-neutral-400">Day-wise & Week-wise Demographic Analysis</p>
                </div>
              </div>
            </div>

            {/* State Picker */}
            <div className="flex items-center gap-2 mb-3 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
              <MapPin size={16} className="text-primary-600 shrink-0 ml-1" />
              <span className="text-xs font-medium text-neutral-600">Comparing with:</span>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="flex-1 bg-white text-xs font-semibold text-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="All India">All India (1,200+ Households)</option>
                {STATES.map(s => (
                  <option key={s} value={s}>
                    {s} {s === profile?.state ? '★ (Your State)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle: Day-Wise vs Week-Wise */}
            <div className="flex bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setComparisonMode('day')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  comparisonMode === 'day'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Calendar size={13} />
                Day-Wise Comparison
              </button>
              <button
                type="button"
                onClick={() => setComparisonMode('week')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  comparisonMode === 'week'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Layers size={13} />
                Week-Wise Comparison
              </button>
            </div>
          </div>

          {/* VIEW 1: DAY-WISE REGIONAL COMPARISON */}
          {comparisonMode === 'day' ? (
            <div className="space-y-4">
              {/* Day Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-primary-50 border border-primary-200 p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-primary-700">Your Daily Intake</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-0.5">
                    {userDailyAvg} <span className="text-xs font-normal text-neutral-500">g / day</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {userDailyAvg <= 25 ? '✅ Within safe limit' : '⚠️ Above 25g safe limit'}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-amber-800">
                    {selectedState || 'Regional'} Average
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 mt-0.5">
                    {regionalMetrics.dailyGrams} <span className="text-xs font-normal text-neutral-500">g / day</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    From {regionalMetrics.sampleCount} survey responses
                  </p>
                </div>
              </div>

              {/* Day Comparison Bar Chart */}
              <div>
                <p className="text-xs font-semibold text-neutral-700 mb-2">
                  Daily Intake Benchmarks (Grams / Person / Day)
                </p>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="g" />
                      <Tooltip
                        formatter={(val: any) => [`${val} grams`, 'Intake']}
                        contentStyle={{ borderRadius: 12, fontSize: 12 }}
                      />
                      <Bar dataKey="grams" radius={[6, 6, 0, 0]}>
                        {dayComparisonData.map(entry => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Day-Wise Conclusion Banner */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  dayDiffFromRegion <= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {dayDiffFromRegion <= 0 ? (
                  <ShieldCheck size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                )}
                <div>
                  <strong>
                    {dayDiffFromRegion <= 0
                      ? `Great job! You consume ${Math.abs(dayDiffFromRegion)}g less oil daily`
                      : `You consume ${dayDiffFromRegion}g more oil daily`}
                  </strong>{' '}
                  than the average household in {selectedState || 'your region'}. The ICMR recommendation is to maintain cooking oil below <strong>25g per day</strong>.
                </div>
              </div>
            </div>
          ) : (
            /* VIEW 2: WEEK-WISE REGIONAL COMPARISON */
            <div className="space-y-4">
              {/* Week Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-primary-50 border border-primary-200 p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-primary-700">Your Weekly Pace</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-0.5">
                    {userWeeklyPace} <span className="text-xs font-normal text-neutral-500">g / week</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Safe Target: {DAILY_LIMIT_GRAMS * 7}g / week
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-amber-800">
                    {selectedState || 'Regional'} Weekly Pace
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 mt-0.5">
                    {regionalMetrics.weeklyGrams} <span className="text-xs font-normal text-neutral-500">g / week</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    National: {nationalMetrics.weeklyGrams}g / week
                  </p>
                </div>
              </div>

              {/* Week Comparison Bar Chart */}
              <div>
                <p className="text-xs font-semibold text-neutral-700 mb-2">
                  Weekly Cumulative Pace (Grams / Person / 7 Days)
                </p>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="g" />
                      <Tooltip
                        formatter={(val: any) => [`${val} grams`, 'Weekly Total']}
                        contentStyle={{ borderRadius: 12, fontSize: 12 }}
                      />
                      <Bar dataKey="grams" radius={[6, 6, 0, 0]}>
                        {weekComparisonData.map(entry => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Week-Wise Conclusion Banner */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  weekDiffFromRegion <= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {weekDiffFromRegion <= 0 ? (
                  <ShieldCheck size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                )}
                <div>
                  <strong>
                    {weekDiffFromRegion <= 0
                      ? `On track to save ~${Math.abs(weekDiffFromRegion)}g of excess oil this week`
                      : `Consuming ~${weekDiffFromRegion}g more oil per week`}
                  </strong>{' '}
                  compared to regional households in {selectedState || 'your state'}. Keeping your weekly intake under <strong>175g</strong> significantly reduces cardiovascular strain.
                </div>
              </div>
            </div>
          )}

          {/* Regional Oil Preferences Breakdown from Survey */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-xs font-semibold text-neutral-700 mb-2 flex items-center justify-between">
              <span>Popular Oils in {selectedState || 'India'} (Survey Data)</span>
              <span className="text-[10px] text-neutral-400 font-normal">{activeBenchmarkPool.length} households</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {regionalPopularOils.slice(0, 3).map(item => (
                <div key={item.oil} className="p-2 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                  <p className="text-[11px] font-semibold text-neutral-800 truncate">{item.oil}</p>
                  <p className="text-xs font-bold text-primary-600 mt-0.5">{item.percentage}%</p>
                  <p className="text-[9px] text-neutral-400">households</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 14-DAY INTAKE TREND WITH SAFE LIMIT */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-neutral-800">Your Intake Trend</h2>
              <p className="text-xs text-neutral-400">Compared with 25g Safe Daily Limit</p>
            </div>
            <BarChart3 size={20} className="text-secondary-500" />
          </div>

          {trendData.length ? (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="g" />
                <Tooltip />
                <Line
                  type="monotone"
                  name="Your Intake (g)"
                  dataKey="grams"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  name="Safe Limit (25g)"
                  dataKey="limit"
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="Log meals for today or past days to see your intake trend curve." />
          )}
        </Card>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs text-neutral-400 mb-1">Days Tracked</p>
            <p className="text-2xl font-bold text-neutral-900">{distinctDaysLogged}</p>
            <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
              <TrendingDown size={13} /> Active logging
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-400 mb-1">Total Meals Logged</p>
            <p className="text-2xl font-bold text-neutral-900">{logs.length}</p>
            <p className="text-xs text-secondary-600 mt-1 flex items-center gap-1">
              <TrendingUp size={13} /> AI model trained
            </p>
          </Card>
        </div>

        {/* Oil Type Breakdown */}
        <Card>
          <h2 className="font-semibold text-neutral-800 mb-1">Your Oil Type Mix</h2>
          <p className="text-xs text-neutral-400 mb-3">Total grams consumed by edible oil category</p>
          {oilData.length ? (
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="48%" height={170}>
                <PieChart>
                  <Pie
                    data={oilData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={38}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {oilData.map(row => (
                      <Cell key={row.name} fill={OIL_COLORS[row.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {oilData.slice(0, 4).map(row => (
                  <div key={row.name} className="flex items-center gap-2 text-xs">
                    <OilTypeIcon type={row.name} size={22} />
                    <span className="flex-1 text-neutral-600 truncate">{row.name}</span>
                    <span className="font-semibold text-neutral-800">{row.value}g</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart text="Your oil variety distribution will appear once you log meals." />
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-36 flex items-center justify-center text-center text-xs text-neutral-400 px-4">
      {text}
    </div>
  );
}
