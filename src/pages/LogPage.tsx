import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Coffee, Sun, Moon, Droplet, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/Card';
import { OilTypeIcon } from '@/components/OilTypeIcon';
import { runPipeline } from '@/lib/models/pipeline';
import {
  OIL_TYPES, MEAL_TYPES, COOKING_METHODS, REUSE_PRACTICES, FRESHNESS_OPTIONS,
} from '@/lib/constants';
import type { OilLog } from '@/lib/types';

const MEAL_ICONS: Record<string, typeof Coffee> = {
  Breakfast: Coffee, Lunch: Sun, Dinner: Moon,
};

export function LogPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [mealType, setMealType] = useState('Breakfast');
  const [oilType, setOilType] = useState<string>(OIL_TYPES[0]);
  const [quantity, setQuantity] = useState('10');
  const [cookingMethod, setCookingMethod] = useState<string>(COOKING_METHODS[0]);
  const [reusePractice, setReusePractice] = useState<string>(REUSE_PRACTICES[0]);
  const [freshness, setFreshness] = useState('fresh');
  const [saving, setSaving] = useState(false);
  const [dayLogs, setDayLogs] = useState<OilLog[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      loadLogsForDate(selectedDate);
    }
  }, [profile, selectedDate]);

  function getDemoLogs(): OilLog[] {
    const raw = localStorage.getItem('oilwise_demo_logs');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return [];
  }

  async function loadLogsForDate(date: string) {
    if (localStorage.getItem('oilwise_demo') === 'true') {
      const demoLogs = getDemoLogs().filter(l => l.log_date === date);
      setDayLogs(demoLogs);
      return;
    }

    if (!profile) return;
    try {
      const { data } = await supabase
        .from('oil_logs')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('log_date', date)
        .order('created_at', { ascending: false });
      setDayLogs((data as OilLog[]) || []);
    } catch {
      // fallback
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    const isDemo = localStorage.getItem('oilwise_demo') === 'true';

    let createdLog: OilLog | null = null;

    if (isDemo) {
      const newDemoLog: OilLog = {
        id: 'log-' + Date.now(),
        user_id: profile.user_id,
        log_date: selectedDate,
        meal_type: mealType,
        oil_type: oilType,
        quantity_grams: parseFloat(quantity) || 10,
        cooking_method: cookingMethod,
        reuse_practice: reusePractice,
        freshness,
        created_at: new Date().toISOString(),
      };
      const allDemoLogs = [newDemoLog, ...getDemoLogs()];
      localStorage.setItem('oilwise_demo_logs', JSON.stringify(allDemoLogs));
      createdLog = newDemoLog;
    } else {
      const { data: newLog, error } = await supabase
        .from('oil_logs')
        .insert({
          user_id: profile.user_id,
          log_date: selectedDate,
          meal_type: mealType,
          oil_type: oilType,
          quantity_grams: parseFloat(quantity) || 10,
          cooking_method: cookingMethod,
          reuse_practice: reusePractice,
          freshness,
        })
        .select()
        .single();

      if (!error && newLog) {
        createdLog = newLog as OilLog;
      }
    }

    if (createdLog) {
      const updatedDayLogs = [createdLog, ...dayLogs];
      try {
        await runPipeline({
          profile,
          logs: updatedDayLogs,
          todayLogs: updatedDayLogs,
          latestLog: createdLog,
          fryingFrequency: '1-2 times a week',
        });
      } catch (err) {
        console.error('Pipeline error:', err);
      }
      await loadLogsForDate(selectedDate);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }

    setSaving(false);
  }

  const totalForDay = dayLogs.reduce((s, l) => s + Number(l.quantity_grams), 0);

  const formattedDateLabel =
    selectedDate === todayStr
      ? "Today's Intake"
      : selectedDate === yesterdayDate
      ? "Yesterday's Intake"
      : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + " Intake";

  return (
    <AppLayout>
      <div className="px-6 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ChevronLeft size={22} className="text-neutral-600" />
          </button>
          <div>
            <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Digital Platform for Oil Monitoring System
            </span>
            <h1 className="text-2xl font-bold text-neutral-900 mt-1">Log Oil Intake</h1>
          </div>
        </div>

        {/* Date Selector: Today, Yesterday, or Past Dates */}
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-primary-600" />
              Log Date
            </span>
            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="text-[11px] font-semibold text-primary-600 hover:underline flex items-center gap-1"
              >
                Jump to Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2.5">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                selectedDate === todayStr
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(yesterdayDate)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                selectedDate === yesterdayDate
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              Yesterday
            </button>
          </div>

          <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
            <Clock size={16} className="text-neutral-400 shrink-0 ml-1" />
            <span className="text-xs text-neutral-500 font-medium">Or Pick Any Past Date:</span>
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={e => e.target.value && setSelectedDate(e.target.value)}
              className="flex-1 bg-white text-xs font-semibold text-neutral-800 px-2.5 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Selected Date Summary Card */}
        <Card className="mb-6 flex items-center gap-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-100">
          <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center shadow-sm">
            <Droplet size={22} className="text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">{formattedDateLabel}</p>
            <p className="text-xl font-bold text-neutral-900">
              {Math.round(totalForDay)}g{' '}
              <span className="text-xs font-normal text-neutral-500">
                / 25g daily safe limit ({totalForDay <= 25 ? 'Within Limit ✅' : 'Exceeded ⚠️'})
              </span>
            </p>
          </div>
        </Card>

        {/* USER-FRIENDLY FEATURE 1: Quick-Add Common Indian Dishes */}
        <div className="mb-5 bg-white/90 p-3.5 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <span>🍛</span> Quick Dish Autofill (1-Tap)
            </span>
            <span className="text-[11px] text-primary-600 font-medium">Popular Indian Meals</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { name: 'Dal Tadka', icon: '🍛', grams: '8', oil: 'Mustard Oil', method: 'Sautéing', meal: 'Lunch' },
              { name: 'Sabzi / Curry', icon: '🍲', grams: '12', oil: 'Sunflower Oil', method: 'Sautéing', meal: 'Dinner' },
              { name: 'Paratha / Roti', icon: '🫓', grams: '6', oil: 'Groundnut Oil', method: 'Shallow frying', meal: 'Breakfast' },
              { name: 'Pakora / Samosa', icon: '🥟', grams: '24', oil: 'Sunflower Oil', method: 'Deep frying', meal: 'Dinner' },
              { name: 'Pulao / Rice', icon: '🍚', grams: '14', oil: 'Sunflower Oil', method: 'Sautéing', meal: 'Lunch' },
              { name: 'Egg Bhurji', icon: '🍳', grams: '10', oil: 'Mustard Oil', method: 'Sautéing', meal: 'Breakfast' },
            ].map(dish => (
              <button
                key={dish.name}
                type="button"
                onClick={() => {
                  setQuantity(dish.grams);
                  setMealType(dish.meal);
                  setOilType(dish.oil);
                  setCookingMethod(dish.method);
                }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-primary-50 hover:border-primary-300 text-xs font-semibold text-neutral-800 transition-all active:scale-95"
              >
                <span>{dish.icon}</span>
                <span>{dish.name}</span>
                <span className="text-[10px] text-neutral-400 font-normal">({dish.grams}g)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Log Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Meal Type */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Meal</label>
            <div className="flex gap-2">
              {MEAL_TYPES.map(meal => {
                const Icon = MEAL_ICONS[meal] || Sun;
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setMealType(meal)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                      mealType === meal
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{meal}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Oil Type */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Oil Type</label>
            <div className="grid grid-cols-4 gap-2">
              {OIL_TYPES.map(oil => (
                <button
                  key={oil}
                  type="button"
                  onClick={() => setOilType(oil)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all ${
                    oilType === oil
                      ? 'bg-primary-50 border-primary-400 ring-2 ring-primary-300'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <OilTypeIcon type={oil} size={32} />
                  <span className="text-[10px] font-medium text-neutral-600 text-center leading-tight">
                    {oil.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* USER-FRIENDLY FEATURE 2: Kitchen Spoon & Portion Estimator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700">Quantity (grams)</label>
              <span className="text-xs text-neutral-400">1 tsp ≈ 5g | 1 tbsp ≈ 14g</span>
            </div>

            {/* Quick Kitchen Portion Presets */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[
                { label: '1 Tsp', val: '5', hint: 'Light' },
                { label: '1 Tbsp', val: '14', hint: 'Regular' },
                { label: '1 Ladle', val: '20', hint: 'Tadka' },
                { label: 'Deep Fry', val: '28', hint: 'Crispy' },
              ].map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setQuantity(item.val)}
                  className={`py-1.5 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                    quantity === item.val
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className={`text-[10px] font-normal ${quantity === item.val ? 'text-primary-100' : 'text-neutral-400'}`}>
                    {item.val}g
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={60}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="flex-1 accent-primary-600 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-16 px-3 py-2 rounded-xl border border-neutral-200 text-center font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <span className="text-sm font-semibold text-neutral-400">g</span>
              </div>
            </div>

            {/* Quick +/- Step Buttons */}
            <div className="flex items-center justify-between gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setQuantity(q => String(Math.max(1, (parseFloat(q) || 0) - 5)))}
                className="flex-1 py-1 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700"
              >
                -5g
              </button>
              <button
                type="button"
                onClick={() => setQuantity(q => String(Math.max(1, (parseFloat(q) || 0) - 1)))}
                className="flex-1 py-1 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700"
              >
                -1g
              </button>
              <button
                type="button"
                onClick={() => setQuantity(q => String((parseFloat(q) || 0) + 1))}
                className="flex-1 py-1 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700"
              >
                +1g
              </button>
              <button
                type="button"
                onClick={() => setQuantity(q => String((parseFloat(q) || 0) + 5))}
                className="flex-1 py-1 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700"
              >
                +5g
              </button>
            </div>
          </div>

          {/* Cooking Method */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Cooking Method</label>
            <div className="flex flex-wrap gap-2">
              {COOKING_METHODS.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setCookingMethod(method)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    cookingMethod === method
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Reuse Practice */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Oil Reuse Practice</label>
            <select
              value={reusePractice}
              onChange={e => setReusePractice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {REUSE_PRACTICES.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Freshness */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Oil Freshness</label>
            <div className="flex gap-2">
              {FRESHNESS_OPTIONS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFreshness(f)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    freshness === f
                      ? f === 'fresh'
                        ? 'bg-success-600 text-white shadow-sm'
                        : f === 'slightly off'
                        ? 'bg-warning-500 text-white shadow-sm'
                        : 'bg-error-600 text-white shadow-sm'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 rounded-xl font-semibold shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 ${
              success ? 'bg-success-600 text-white' : 'bg-primary-600 text-white shadow-primary-200'
            } disabled:opacity-50`}
          >
            {success ? (
              <>
                <Check size={20} /> Saved to {formattedDateLabel}!
              </>
            ) : saving ? (
              'Saving...'
            ) : (
              `Log Meal (${selectedDate === todayStr ? 'Today' : selectedDate})`
            )}
          </button>
        </form>

        {/* Entries for selected date */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-800">
              Entries for {selectedDate === todayStr ? 'Today' : selectedDate}
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              {dayLogs.length} {dayLogs.length === 1 ? 'meal' : 'meals'} logged
            </span>
          </div>

          {dayLogs.length > 0 ? (
            <div className="space-y-2">
              {dayLogs.map(log => (
                <Card key={log.id} className="flex items-center gap-3 py-3 hover:border-neutral-300 transition-colors">
                  <OilTypeIcon type={log.oil_type} size={40} />
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800 text-sm">
                      {log.meal_type} — {log.oil_type}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {log.cooking_method} · <strong className="text-neutral-700">{log.quantity_grams}g</strong> · {log.reuse_practice}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                    {log.quantity_grams}g
                  </span>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-neutral-100 rounded-2xl text-center text-xs text-neutral-500">
              No entries logged for this date yet. Select your meal and tap <strong>Log Meal</strong> above!
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
