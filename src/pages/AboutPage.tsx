import { BookOpen, BrainCircuit, Database, Droplet, ShieldCheck, ChevronLeft, BarChart3, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';

export function AboutPage() {
  return (
    <div className="min-h-screen py-6 px-4 flex justify-center">
      <div className="max-w-md w-full bg-white/88 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/10 border border-neutral-200/60 my-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-primary-600 mb-6 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 transition-colors">
          <ChevronLeft size={16} /> Back to Home
        </Link>

        <div>
          <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1.5">
            Project Overview
          </span>
          <h1 className="text-3xl font-bold text-neutral-900 leading-tight">
            Digital Platform for Oil Monitoring System
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed mt-3">
            A comprehensive digital health and monitoring platform designed to measure, analyze, and optimize edible cooking oil consumption across Indian households.
          </p>
        </div>

        <div className="space-y-3 mt-6">
          <Note
            icon={Clock}
            title="Current & Past-Day Logging"
            text="Enables flexible intake tracking by breakfast, lunch, and dinner. Users can record meals for today or retroactively log past days with a date selector, ensuring complete and uninterrupted nutritional histories."
          />
          <Note
            icon={BarChart3}
            title="Day-Wise & Week-Wise Regional Benchmarks"
            text="Provides granular comparisons against 1,200+ surveyed households across all Indian states and zones. Evaluates intake day-wise (against the 25g/day ICMR limit) and week-wise (against 175g/week target) to highlight consumption variances."
          />
          <Note
            icon={BrainCircuit}
            title="Three-Model AI Evaluation Pipeline"
            text="Integrates an Oil Quality Classifier (evaluating degradation and thermal reuse cycles), an explainable Health Risk Assessment tree (weighing BMI, age, and activity), and personalized behavioral recommendations."
          />
          <Note
            icon={Database}
            title="Demographic Survey Analytics"
            text="Built on 1,200+ actual respondent entries covering purchase volumes, oil varieties (Mustard, Sunflower, Groundnut, Coconut, Palm, etc.), deep-frying frequencies, and reuse practices across Urban and Rural demographics."
          />
          <Note
            icon={ShieldCheck}
            title="Secure & Privacy-Preserving"
            text="Employs Supabase PostgreSQL Row Level Security (RLS) so personal intake data is strictly private and scoped to authenticated users, with offline PWA caching enabled."
          />
        </div>

        <Card className="mt-6 bg-gradient-to-r from-primary-600 to-secondary-600 border-0 text-white shadow-lg shadow-primary-200">
          <p className="text-sm font-bold flex items-center gap-1.5">
            <Droplet size={18} /> Promoting Public Health Awareness
          </p>
          <p className="text-xs text-primary-100 mt-1 leading-relaxed">
            By digitizing edible oil monitoring, the system bridges the gap between dietary guidelines and daily kitchen cooking habits.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Note({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <Card className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-primary-600" />
      </div>
      <div>
        <h2 className="font-semibold text-neutral-800 text-sm">{title}</h2>
        <p className="text-xs text-neutral-500 leading-relaxed mt-1">{text}</p>
      </div>
    </Card>
  );
}
