export const TYPES = ['FL', 'RT', 'TP', 'RS', 'RC', 'BT', 'CH'];
export const STATUSES = ['reported', 'operational', 'maintenance', 'vendor', 'parts', 'out'];
export const DOWN = ['out', 'vendor', 'parts', 'maintenance'];

export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());
}

export function addMonths(iso, m) {
  const [y, mo, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, mo - 1 + m, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(d, last));
  return t.toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400e3);
}

// An asset's own interval wins; otherwise the type default from Settings.
export function plan(a, st) {
  const d = st.intervals?.[a.type] || {};
  return { h: a.interval_hours || d.h || null, m: a.interval_months || d.m || null };
}

export function nextDue(a, st) {
  if (a.next_service) return a.next_service;
  const p = plan(a, st);
  return a.last_service && p.m ? addMonths(a.last_service, p.m) : null;
}

export function hourProgress(a, st) {
  const p = plan(a, st);
  if (!p.h || a.hours == null) return null;
  return (a.hours - (a.last_meter || 0)) / p.h;
}

export function serviceState(a, st, today = todayISO()) {
  if (DOWN.includes(a.status)) return 'out';
  const nd = nextDue(a, st);
  const hp = hourProgress(a, st);
  if ((nd && nd < today) || (hp != null && hp >= 1)) return 'overdue';
  const soonPct = (st.hourDueSoonPct || 90) / 100;
  if ((nd && daysBetween(today, nd) <= (st.dueSoonDays || 14)) || (hp != null && hp >= soonPct)) return 'due';
  if (nd || hp != null) return 'ok';
  return 'noplan';
}
