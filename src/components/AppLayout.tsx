import { type ReactNode } from 'react';
import { BottomNav } from './BottomNav';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen max-w-md mx-auto pb-24 bg-white/92 backdrop-blur-md shadow-2xl shadow-emerald-950/10 border-x border-neutral-200/60">
      <div className="animate-fade-in">{children}</div>
      <BottomNav />
    </div>
  );
}
