import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Info, CheckCheck, BellRing, BellOff, Sparkles, Send } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/Card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getNotificationPermission, requestNotificationPermission, sendSystemNotification, type NotificationPermissionStatus } from '@/lib/notifications';
import type { Alert } from '@/lib/types';

export function AlertsPage() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionStatus>('default');
  const [testingNotif, setTestingNotif] = useState(false);

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
    if (profile) loadAlerts();
  }, [profile]);

  async function handleRequestPermission() {
    const status = await requestNotificationPermission();
    setNotifPermission(status);
    if (status === 'granted') {
      await sendSystemNotification('🔔 Notifications Enabled!', {
        body: 'OilWise will now alert you whenever your daily oil intake crosses safe dietary limits.',
      });
    }
  }

  async function handleSendTestNotification() {
    setTestingNotif(true);
    const title = '⚠️ OilWise Intake Warning';
    const message = 'Daily oil consumption reached 28g (3g above safe limit). Consider steamed or baked options for your next meal!';

    const sent = await sendSystemNotification(title, {
      body: message,
    });

    // Also add to local alert feed so it shows in app
    const testAlert: Alert = {
      id: 'alert-test-' + Date.now(),
      user_id: profile?.user_id || 'test-user',
      message: `${title}: ${message}`,
      severity: 'warning',
      read: false,
      created_at: new Date().toISOString(),
    };

    setAlerts(prev => [testAlert, ...prev]);

    const isDemo = localStorage.getItem('oilwise_demo') === 'true';
    if (isDemo) {
      try {
        const prevAlerts = JSON.parse(localStorage.getItem('oilwise_demo_alerts') || '[]');
        localStorage.setItem('oilwise_demo_alerts', JSON.stringify([testAlert, ...prevAlerts]));
      } catch (e) {
        console.error(e);
      }
    }

    setTimeout(() => setTestingNotif(false), 1200);
  }

  async function loadAlerts() {
    const isDemo = localStorage.getItem('oilwise_demo') === 'true';
    if (isDemo) {
      try {
        const demoAlerts = JSON.parse(localStorage.getItem('oilwise_demo_alerts') || '[]');
        setAlerts(demoAlerts);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('alerts').select('*').eq('user_id', profile!.user_id).order('created_at', { ascending: false });
    setAlerts((data as Alert[]) || []);
    setLoading(false);
  }

  async function markAllRead() {
    const isDemo = localStorage.getItem('oilwise_demo') === 'true';
    if (isDemo) {
      const updated = alerts.map(alert => ({ ...alert, read: true }));
      setAlerts(updated);
      localStorage.setItem('oilwise_demo_alerts', JSON.stringify(updated));
      return;
    }
    await supabase.from('alerts').update({ read: true }).eq('user_id', profile!.user_id);
    setAlerts(current => current.map(alert => ({ ...alert, read: true })));
  }

  async function markRead(id: string) {
    const isDemo = localStorage.getItem('oilwise_demo') === 'true';
    if (isDemo) {
      const updated = alerts.map(alert => alert.id === id ? { ...alert, read: true } : alert);
      setAlerts(updated);
      localStorage.setItem('oilwise_demo_alerts', JSON.stringify(updated));
      return;
    }
    await supabase.from('alerts').update({ read: true }).eq('id', id).eq('user_id', profile!.user_id);
    setAlerts(current => current.map(alert => alert.id === id ? { ...alert, read: true } : alert));
  }

  const unread = alerts.filter(alert => !alert.read).length;

  if (loading) {
    return (
      <AppLayout>
        <div className="px-6 pt-8 animate-pulse space-y-3">
          <div className="h-8 bg-neutral-200 rounded w-1/2" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-neutral-200 rounded-2xl" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-6 pt-8 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
              Digital Platform for Oil Monitoring System
            </span>
            <h1 className="text-2xl font-bold text-neutral-900">
              Alerts & Notifications {unread > 0 && <span className="text-sm font-semibold text-error-500">({unread} new)</span>}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">Real-time health guidance and limit notifications</p>
          </div>
          {alerts.length > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-2">
              <CheckCheck size={15} /> Mark read
            </button>
          )}
        </div>

        {/* Browser & System Notification Settings Card */}
        <Card className="mb-6 border-primary-100 bg-gradient-to-br from-primary-50/70 via-white to-secondary-50/40 shadow-sm">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              notifPermission === 'granted'
                ? 'bg-emerald-100 text-emerald-600'
                : notifPermission === 'denied'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-primary-100 text-primary-600'
            }`}>
              {notifPermission === 'granted' ? (
                <BellRing size={20} />
              ) : notifPermission === 'denied' ? (
                <BellOff size={20} />
              ) : (
                <Bell size={20} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-800">Push & System Notifications</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                  notifPermission === 'granted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : notifPermission === 'denied'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {notifPermission === 'granted' ? 'Active ✅' : notifPermission === 'denied' ? 'Blocked ❌' : 'Not Enabled ⚠️'}
                </span>
              </div>

              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                {notifPermission === 'granted'
                  ? 'System notifications are active. You will receive native alerts whenever your oil intake exceeds safe limits or critical risk is detected.'
                  : notifPermission === 'denied'
                  ? 'Browser notifications are blocked in your site settings. Click the lock/tune icon near your browser address bar to allow notifications.'
                  : 'Get instant system pop-up notifications on your desktop or phone when you log high-oil meals or reuse cycles.'}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3.5">
                {notifPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <BellRing size={14} /> Enable Notifications
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={testingNotif}
                  className="py-2 px-3 text-xs font-semibold rounded-xl bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={13} className="text-primary-600" />
                  {testingNotif ? 'Sending...' : 'Send Test Notification'}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Alert Feed */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Alert History</h2>
          <span className="text-xs text-neutral-400 font-medium">{alerts.length} total</span>
        </div>

        {alerts.length === 0 ? (
          <Card className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <Bell size={26} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-neutral-800">No alerts yet</h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-xs mx-auto">
              Log a meal or tap <strong>Send Test Notification</strong> above to see instant health alerts and dietary advice.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onRead={() => markRead(alert.id)} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
function AlertCard({ alert, onRead }: { alert: Alert; onRead: () => void }) { const Icon = alert.severity === 'critical' || alert.severity === 'warning' ? AlertTriangle : alert.severity === 'info' ? Info : CheckCircle2; const color = alert.severity === 'critical' ? 'text-error-600 bg-error-50 border-error-100' : alert.severity === 'warning' ? 'text-warning-700 bg-warning-50 border-warning-100' : 'text-secondary-600 bg-secondary-50 border-secondary-100'; return <Card onClick={!alert.read ? onRead : undefined} className={`${!alert.read ? 'border-primary-200 shadow-md' : ''}`}><div className="flex items-start gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon size={18} /></div><div className="flex-1"><div className="flex items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{alert.severity}</span>{!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />}</div><p className="text-sm text-neutral-700 leading-relaxed mt-1">{alert.message}</p><p className="text-xs text-neutral-400 mt-2">{new Date(alert.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p></div></div></Card>; }
