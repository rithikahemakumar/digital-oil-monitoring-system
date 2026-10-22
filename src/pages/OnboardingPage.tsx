import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { STATES, STATE_TO_ZONE, ACTIVITY_LEVELS } from '@/lib/constants';
import type { Profile } from '@/lib/types';

const COMMON_CONDITIONS = ['Hypertension', 'Diabetes', 'Heart Disease', 'High Cholesterol', 'Obesity', 'Thyroid'];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile, saveCustomProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    age: '',
    bmi: '',
    activity_level: 'Moderate',
    pre_existing_conditions: [] as string[],
    household_size: '',
    state: '',
  });

  const steps = ['Personal', 'Health', 'Household'];

  function update(key: string, value: string | string[]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleCondition(cond: string) {
    setForm(prev => ({
      ...prev,
      pre_existing_conditions: prev.pre_existing_conditions.includes(cond)
        ? prev.pre_existing_conditions.filter(c => c !== cond)
        : [...prev.pre_existing_conditions, cond],
    }));
  }

  async function handleFinish() {
    setLoading(true);
    setErrorMsg('');
    try {
      const zone = STATE_TO_ZONE[form.state] || 'North';

      // 1. Check if user is in Demo Mode
      if (localStorage.getItem('oilwise_demo') === 'true' || !user || user.id === '00000000-0000-0000-0000-000000000001') {
        const demoProf: Profile = {
          id: '00000000-0000-0000-0000-000000000002',
          user_id: user?.id || '00000000-0000-0000-0000-000000000001',
          name: form.name.trim() || 'User',
          age: parseInt(form.age) || 30,
          bmi: parseFloat(form.bmi) || 22.0,
          activity_level: form.activity_level,
          pre_existing_conditions: form.pre_existing_conditions,
          household_size: parseInt(form.household_size) || 4,
          state: form.state || 'Maharashtra',
          zone,
          created_at: new Date().toISOString(),
        };
        saveCustomProfile(demoProf);
        navigate('/dashboard', { replace: true });
        return;
      }

      // 2. Real authenticated Supabase user
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        throw new Error('User session not found. Please sign in again.');
      }

      const profilePayload = {
        user_id: currentUser.id,
        name: form.name.trim(),
        age: parseInt(form.age),
        bmi: parseFloat(form.bmi),
        activity_level: form.activity_level,
        pre_existing_conditions: form.pre_existing_conditions,
        household_size: parseInt(form.household_size),
        state: form.state,
        zone,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        // If upsert without constraint on user_id, fall back to insert
        const insertRes = await supabase.from('profiles').insert(profilePayload).select().single();
        if (insertRes.error) {
          throw new Error(insertRes.error.message);
        }
        if (insertRes.data) {
          saveCustomProfile(insertRes.data as Profile);
        }
      } else if (data) {
        saveCustomProfile(data as Profile);
      }

      await refreshProfile();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setErrorMsg(err.message || 'Failed to complete profile setup. Please try again.');
      setLoading(false);
    }
  }

  const canProceed = [
    form.name && form.age,
    form.bmi && form.activity_level,
    form.household_size && form.state,
  ][step];

  return (
    <div className="min-h-screen py-6 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/88 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/10 border border-neutral-200/60 my-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Droplet size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">Welcome to OilWise</p>
            <p className="text-xs text-neutral-500">Let's set up your profile</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-primary-500' : 'bg-neutral-200'}`} />
              <p className={`text-xs mt-1.5 font-medium ${i <= step ? 'text-primary-600' : 'text-neutral-400'}`}>{s}</p>
            </div>
          ))}
        </div>

        {/* Step 0: Personal */}
        {step === 0 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Age</label>
              <input
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={e => update('age', e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>
        )}

        {/* Step 1: Health */}
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">BMI (Body Mass Index)</label>
              <input
                type="number"
                step="0.1"
                min={10}
                max={60}
                value={form.bmi}
                onChange={e => update('bmi', e.target.value)}
                placeholder="e.g. 22.5"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <p className="text-xs text-neutral-400 mt-1">Normal range: 18.5 – 24.9</p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Activity Level</label>
              <div className="flex gap-2">
                {ACTIVITY_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => update('activity_level', level)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      form.activity_level === level
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white border border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Pre-existing Conditions</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map(cond => (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                      form.pre_existing_conditions.includes(cond)
                        ? 'bg-error-50 text-error-600 border border-error-200'
                        : 'bg-white border border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
                <button
                  onClick={() => toggleCondition('None')}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    form.pre_existing_conditions.includes('None')
                      ? 'bg-primary-50 text-primary-600 border border-primary-200'
                      : 'bg-white border border-neutral-200 text-neutral-600'
                  }`}
                >
                  None
                  </button>
              </div>
              <p className="text-xs text-neutral-400 mt-1">Tap all that apply</p>
            </div>
          </div>
        )}

        {/* Step 2: Household */}
        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Household Size</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.household_size}
                onChange={e => update('household_size', e.target.value)}
                placeholder="Number of people in your household"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">State</label>
              <select
                value={form.state}
                onChange={e => update('state', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Select your state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {form.state && (
                <p className="text-xs text-primary-600 mt-1.5 font-medium">
                  Zone: {STATE_TO_ZONE[form.state]}
                </p>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 mt-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-semibold active:scale-[0.98] transition-transform"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="flex-1 py-3.5 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-1"
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed || loading}
              className="flex-1 py-3.5 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
