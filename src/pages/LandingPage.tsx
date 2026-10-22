import { Link } from 'react-router-dom';
import { Droplet, Heart, BarChart3, Bell, ShieldCheck } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen py-6 px-4 flex items-center justify-center">
      {/* Hero */}
      <div className="max-w-md w-full bg-white/88 backdrop-blur-lg rounded-3xl px-6 py-10 shadow-2xl shadow-emerald-950/10 border border-neutral-200/60 my-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
            <Droplet size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">OilWise</h1>
            <p className="text-xs font-medium text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full inline-block mt-0.5 border border-primary-200">
              Digital Platform for Oil Monitoring System
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-neutral-900 leading-tight mb-3">
          Smart digital platform for tracking cooking oil & health risk.
        </h2>
        <p className="text-neutral-600 leading-relaxed mb-8">
          Indian households consume far more edible oil than the recommended 20–25g per person per day.
          Our digital oil monitoring platform helps you log daily and past meals, understand intake trends, and compare day-wise & week-wise against 1,200+ surveyed households.
        </p>

        <div className="space-y-3 mb-10">
          {[
            { icon: Droplet, title: 'Log current & past days oil intake', desc: 'Easily record meal oil consumption for today or any past date' },
            { icon: Heart, title: 'AI health risk assessment', desc: 'Get personalized risk scores and cooking safety recommendations' },
            { icon: BarChart3, title: 'Day-wise & week-wise regional benchmarks', desc: 'Compare your intake against 1,200+ surveyed households across all states' },
            { icon: Bell, title: 'Smart limits & alerts', desc: 'Get notified before exceeding ICMR recommended safe dietary thresholds' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800 text-sm">{title}</p>
                <p className="text-sm text-neutral-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            to="/auth"
            className="block w-full text-center py-3.5 rounded-xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform"
          >
            Get Started
          </Link>
          <Link
            to="/auth?mode=login"
            className="block w-full text-center py-3.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-semibold active:scale-[0.98] transition-transform"
          >
            I already have an account
          </Link>
          <button
            type="button"
            onClick={() => {
              const text = `🍳 Digital Platform for Oil Monitoring System (OilWise)\n\nTrack your cooking oil consumption, get AI dietary risk scores, and benchmark against 1,200+ households.\n\nOpen link:\n${window.location.origin}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold active:scale-[0.98] transition-transform text-sm"
          >
            <span>💬</span> Share on WhatsApp
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-neutral-400">
          <ShieldCheck size={14} />
          <span>Your data is private and secured with row-level encryption</span>
        </div>
      </div>
    </div>
  );
}
