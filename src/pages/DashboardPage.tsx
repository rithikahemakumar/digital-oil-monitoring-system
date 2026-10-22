import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, TrendingUp, AlertTriangle, CheckCircle2, Coffee, Sun, Moon, Calendar, BarChart3, Clock, Sparkles, Flame, ChefHat, ChevronDown, ChevronUp, Eye, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { ProgressRing } from '@/components/ProgressRing';
import { Card } from '@/components/Card';
import { OilTypeIcon } from '@/components/OilTypeIcon';
import type { OilLog, Alert } from '@/lib/types';

const MEAL_ICONS: Record<string, typeof Coffee> = {
  Breakfast: Coffee, Lunch: Sun, Dinner: Moon,
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [todayLogs, setTodayLogs] = useState<OilLog[]>([]);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKitchenGuide, setShowKitchenGuide] = useState(false);
  const [bgClarity, setBgClarity] = useState<'balanced' | 'vibrant' | 'subtle'>('balanced');

  useEffect(() => {
    const saved = (localStorage.getItem('oilwise_bg_clarity') as any) || 'balanced';
    setBgClarity(saved);
    document.body.setAttribute('data-bg-clarity', saved);
  }, []);

  function toggleBgClarity() {
    const next = bgClarity === 'balanced' ? 'vibrant' : bgClarity === 'vibrant' ? 'subtle' : 'balanced';
    setBgClarity(next);
    localStorage.setItem('oilwise_bg_clarity', next);
    document.body.setAttribute('data-bg-clarity', next);
  }

  function shareOnWhatsApp() {
    const shareUrl = window.location.origin;
    const shareText = `🍳 Digital Platform for Oil Monitoring System (OilWise)\n\nTrack your daily cooking oil consumption, monitor health risks against ICMR limits (25g/day), and compare intake against 1,200+ survey benchmarked Indian households!\n\nCheck out the platform:\n${shareUrl}`;
    const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waLink, '_blank');
  }

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  async function loadData() {
    const today = new Date().toISOString().split('T')[0];
    const isDemo = localStorage.getItem('oilwise_demo') === 'true';

    if (isDemo) {
      try {
        const rawLogs = localStorage.getItem('oilwise_demo_logs');
        if (rawLogs) {
          const allLogs = JSON.parse(rawLogs) as OilLog[];
          const todayDemoLogs = allLogs.filter(l => l.log_date === today);
          setTodayLogs(todayDemoLogs);
        }
        const rawAlerts = localStorage.getItem('oilwise_demo_alerts');
        if (rawAlerts) {
          const alertsList = JSON.parse(rawAlerts) as Alert[];
          if (alertsList.length > 0) {
            setLatestAlert(alertsList[0]);
          }
        }
      } catch (e) {
        console.error('Demo data load error:', e);
      }
      setLoading(false);
      return;
    }

    try {
      const { data: logs } = await supabase
        .from('oil_logs')
        .select('*')
        .eq('user_id', profile!.user_id)
        .eq('log_date', today)
        .order('created_at', { ascending: false });
      setTodayLogs((logs as OilLog[]) || []);

      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', profile!.user_id)
        .order('created_at', { ascending: false })
        .limit(1);
      setLatestAlert((alerts?.[0] as Alert) || null);
    } catch (e) {
      console.error('Supabase load error:', e);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="px-6 pt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-1/2" />
            <div className="h-48 bg-neutral-200 rounded-2xl" />
            <div className="h-24 bg-neutral-200 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const totalGrams = todayLogs.reduce((sum, log) => sum + Number(log.quantity_grams), 0);

  return (
    <AppLayout>
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Digital Platform for Oil Monitoring System
          </span>

          {/* Background Clarity Switcher */}
          <button
            type="button"
            onClick={toggleBgClarity}
            title="Adjust background image visibility"
            className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 bg-white/90 border border-neutral-200 hover:border-primary-400 px-2 py-0.5 rounded-full shadow-xs active:scale-95 transition-all"
          >
            <Eye size={12} className="text-primary-600" />
            <span>Bg: <strong className="capitalize">{bgClarity}</strong></span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {profile?.state && (
            <span className="text-xs text-neutral-500 font-medium">
              {profile.state} • {profile.zone}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-4 mt-1">
          Hi, {profile?.name?.split(' ')[0] || 'there'} 👋
        </h1>

        {/* Motivational Habit Streak Banner */}
        <div className="mb-4 bg-gradient-to-r from-emerald-500/10 via-primary-50 to-teal-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Flame size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                Safe Habit Streak <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-semibold">Active</span>
              </p>
              <p className="text-[11px] text-neutral-500">
                {totalGrams <= 25 ? 'On track today with ICMR 20–25g limit' : 'Intake exceeded 25g limit today'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-white/80 px-2 py-1 rounded-lg border border-emerald-200 shadow-xs">
            ICMR Target
          </span>
        </div>

        {/* Progress Ring */}
        <Card className="flex flex-col items-center mb-5 py-7 bg-white shadow-sm">
          <ProgressRing grams={totalGrams} size={200} />
          <p className="text-sm text-neutral-600 mt-4 text-center font-medium">
            {totalGrams === 0
              ? 'No oil logged yet today. Tap the button below to log your meals.'
              : `${todayLogs.length} meal${todayLogs.length > 1 ? 's' : ''} logged today (${Math.round(totalGrams)}g)`}
          </p>
        </Card>

        {/* Action Buttons: Log Intake & Regional Comparison */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => navigate('/log')}
            className="p-3.5 rounded-2xl bg-primary-600 text-white font-semibold shadow-md shadow-primary-200 active:scale-[0.98] transition-all flex flex-col items-start gap-1 text-left"
          >
            <div className="flex items-center justify-between w-full">
              <PlusCircle size={20} />
              <span className="text-[10px] bg-primary-700 text-primary-100 px-1.5 py-0.5 rounded font-medium">Today / Past</span>
            </div>
            <span className="text-sm mt-1">Log Meals</span>
            <span className="text-[11px] text-primary-100 font-normal">Quick presets & spoon guide</span>
          </button>

          <button
            onClick={() => navigate('/insights')}
            className="p-3.5 rounded-2xl bg-white border border-neutral-200 text-neutral-800 font-semibold shadow-sm hover:border-primary-300 active:scale-[0.98] transition-all flex flex-col items-start gap-1 text-left"
          >
            <div className="flex items-center justify-between w-full">
              <BarChart3 size={20} className="text-primary-600" />
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">Day & Week</span>
            </div>
            <span className="text-sm mt-1">Regional Benchmarks</span>
            <span className="text-[11px] text-neutral-400 font-normal">Compare vs 1,200+ homes</span>
          </button>
        </div>

        {/* USER-FRIENDLY FEATURE 3: Expandable Kitchen Oil Swap & Savings Guide */}
        <Card className="mb-5 border-primary-100 bg-gradient-to-r from-amber-50/50 to-primary-50/40">
          <button
            type="button"
            onClick={() => setShowKitchenGuide(!showKitchenGuide)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <ChefHat size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Kitchen Smart Swaps Guide</p>
                <p className="text-[11px] text-neutral-500">How to cut 10–20g oil daily without losing taste</p>
              </div>
            </div>
            {showKitchenGuide ? <ChevronUp size={18} className="text-neutral-500" /> : <ChevronDown size={18} className="text-neutral-500" />}
          </button>

          {showKitchenGuide && (
            <div className="mt-3 pt-3 border-t border-neutral-200/60 space-y-2 text-xs text-neutral-600 animate-fade-in">
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                <p className="font-semibold text-neutral-800">🥄 Measure with a Teaspoon, Don't Free-Pour</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Free pouring from cooking oil pouches adds 15–20g extra oil per dish. 1 teaspoon (5g) is plenty for most dal tadkas.</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                <p className="font-semibold text-neutral-800">🍟 Air Fry or Oven Roast (Save 70% Oil)</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Air-fried pakoras and snacks absorb only 5–7g oil compared to 25g+ in traditional deep frying.</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                <p className="font-semibold text-neutral-800">🌡️ Respect Smoke Points</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Mustard (250°C) and Groundnut (232°C) handle high Indian flame cooking best, preventing toxic polar compounds.</p>
              </div>
            </div>
          )}
        </Card>

        {/* Today's Meals */}
        {todayLogs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">Today's Meals</h2>
            <div className="space-y-2">
              {todayLogs.map(log => {
                const MealIcon = MEAL_ICONS[log.meal_type] || Sun;
                return (
                  <Card key={log.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                      <MealIcon size={18} className="text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-800 text-sm">{log.meal_type} — {log.oil_type}</p>
                      <p className="text-xs text-neutral-400">{log.cooking_method} · {log.quantity_grams}g</p>
                    </div>
                    <OilTypeIcon type={log.oil_type} size={36} />
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Latest Alert */}
        {latestAlert && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">Latest Alert</h2>
            <Card className={`flex items-start gap-3 ${
              latestAlert.severity === 'critical' ? 'border-error-200 bg-error-50' :
              latestAlert.severity === 'warning' ? 'border-warning-200 bg-warning-50' :
              'border-primary-200 bg-primary-50'
            }`}>
              {latestAlert.severity === 'critical' ? (
                <AlertTriangle size={20} className="text-error-500 shrink-0 mt-0.5" />
              ) : latestAlert.severity === 'warning' ? (
                <AlertTriangle size={20} className="text-warning-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 size={20} className="text-primary-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-neutral-800">{latestAlert.message}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {new Date(latestAlert.created_at).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* USER-FRIENDLY FEATURE: Share via WhatsApp Banner */}
        <div className="mt-6 mb-2 bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-bold flex items-center gap-1.5 text-white">
              <span>💬</span> Share Platform on WhatsApp
            </p>
            <p className="text-[11px] text-emerald-100 mt-0.5 leading-snug">
              Send this tool to family & friends to compare regional cooking oil health!
            </p>
          </div>
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="px-3 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Share2 size={13} className="text-[#25D366]" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
