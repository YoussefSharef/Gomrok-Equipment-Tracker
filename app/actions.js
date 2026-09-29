'use server';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, audit, getSettings } from '@/lib/db';
import { startSession, endSession, requireUser, can, MAX_ATTEMPTS, LOCK_MINUTES } from '@/lib/auth';
import { getT } from '@/lib/i18n';
import { TYPES, STATUSES } from '@/lib/rules';

const PIN_RE = /^\d{4}$/;
const q = (s) => encodeURIComponent(s);
const str = (fd, k) => String(fd.get(k) ?? '').trim();

/* ---------- Language ---------- */
export async function setLang(formData) {
  const lang = str(formData, 'lang') === 'ar' ? 'ar' : 'en';
  (await cookies()).set('lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  const ref = (await headers()).get('referer');
  let back = '/';
  try { if (ref) { const u = new URL(ref); u.searchParams.delete('ok'); u.searchParams.delete('v'); back = u.pathname + u.search; } } catch {}
  redirect(back);
}

/* ---------- Sign in ---------- */
export async function login(formData) {
  const s = await db();
  const pid = Number(str(formData, 'person'));
  const pin = str(formData, 'pin');
  if (!pid) redirect('/login?e=errSelectName');
  const [p] = await s('select * from people where id = $1 and active', [pid]);
  if (!p) redirect('/login?e=errSelectName');
  const back = (e, extra = '') => redirect(`/login?e=${e}&p=${pid}${extra}`);

  if (p.locked_until && new Date(p.locked_until) > new Date()) back('errLocked', `&until=${q(p.locked_until)}`);

  if (!p.pin_hash) {
    // First-run only: allowed while nobody in the system has a PIN yet.
    const [{ n }] = await s('select count(*)::int as n from people where pin_hash is not null');
    if (n > 0 || p.role !== 'admin') back('errNoPin');
    const confirm = str(formData, 'confirm');
    if (!PIN_RE.test(pin)) back('errPinFormat');
    if (pin !== confirm) back('errPinMismatch');
    await s('update people set pin_hash = $1 where id = $2', [await bcrypt.hash(pin, 10), pid]);
    await audit(s, pid, 'person', pid, 'first_pin_set', null, null);
    await startSession(pid);
    redirect('/equipment');
  }

  if (!PIN_RE.test(pin) || !(await bcrypt.compare(pin, p.pin_hash))) {
    const fails = p.failed_attempts + 1;
    if (fails >= MAX_ATTEMPTS) {
      const until = new Date(Date.now() + LOCK_MINUTES * 60e3).toISOString();
      await s('update people set failed_attempts = 0, locked_until = $1 where id = $2', [until, pid]);
      await audit(s, pid, 'person', pid, 'locked_out', null, null);
      back('errLocked', `&until=${q(until)}`);
    }
    await s('update people set failed_attempts = $1 where id = $2', [fails, pid]);
    back('errWrongPin', `&n=${MAX_ATTEMPTS - fails}`);
  }
  await s('update people set failed_attempts = 0, locked_until = null where id = $1', [pid]);
  await startSession(pid);
  redirect('/equipment');
}

export async function logout() {
  await endSession();
  redirect('/login');
}

/* ---------- Equipment ---------- */
const NUM_FIELDS = [['year', 'f_year'], ['hours', 'f_hours'], ['last_meter', 'f_lastMeter'], ['interval_hours', 'f_planH'], ['interval_months', 'f_planM']];
const DATE_FIELDS = ['purchased', 'warranty', 'last_service', 'next_service'];

export async function saveAsset(prev, formData) {
  const user = await requireUser();
  const { t } = await getT();
  const mode = str(formData, 'mode');
  if (!can(user, mode === 'edit' ? 'asset.edit' : 'asset.add')) return { error: t('noAccess') };

  const v = {
    id: str(formData, 'id').toUpperCase(), type: str(formData, 'type'), brand: str(formData, 'brand'),
    model: str(formData, 'model'), serial: str(formData, 'serial'), zone: str(formData, 'zone'), partner: str(formData, 'partner'),
    status: str(formData, 'status') || 'operational',
  };
  if (!TYPES.includes(v.type)) v.type = 'FL';
  if (!STATUSES.includes(v.status)) v.status = 'operational';
  if (!v.id) return { error: t('errIdRequired') };
  if (!/^[A-Z0-9][A-Z0-9-]{0,23}$/.test(v.id)) return { error: t('errIdFormat') };
  if (!v.brand && !v.serial) return { error: t('errBrandSerial') };
  for (const [k, label] of NUM_FIELDS) {
    const raw = str(formData, k);
    if (raw === '') { v[k] = null; continue; }
    const n = Number(raw.replace(/,/g, ''));
    if (!Number.isFinite(n) || n < 0) return { error: t('errNumber', { field: t(label) }) };
    v[k] = ['year', 'interval_hours', 'interval_months'].includes(k) ? Math.round(n) : n;
  }
  for (const k of DATE_FIELDS) {
    const d = str(formData, k);
    v[k] = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  }

  const cols = ['type', 'brand', 'model', 'year', 'serial', 'zone', 'hours', 'last_meter', 'purchased', 'warranty',
    'interval_hours', 'interval_months', 'last_service', 'next_service', 'partner', 'status'];
  try {
    const s = await db();
    if (mode === 'edit') {
      const orig = str(formData, 'orig');
      const [before] = await s('select * from assets where id = $1', [orig]);
      if (!before) return { error: t('errGeneric') };
      const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
      await s(`update assets set ${sets}, updated_at = now(), updated_by = $${cols.length + 1} where id = $${cols.length + 2}`,
        [...cols.map((c) => v[c]), user.id, orig]);
      await audit(s, user.id, 'asset', orig, 'update', before, v);
      redirect(`/equipment/${q(orig)}?ok=tSaved&v=${q(orig)}`);
    }
    const [dup] = await s('select id from assets where id = $1', [v.id]);
    if (dup) return { error: t('errIdTaken', { id: v.id }) };
    const all = ['id', ...cols, 'created_by', 'updated_by'];
    await s(`insert into assets (${all.join(',')}) values (${all.map((_, i) => '$' + (i + 1)).join(',')})`,
      [v.id, ...cols.map((c) => v[c]), user.id, user.id]);
    await audit(s, user.id, 'asset', v.id, 'create', null, v);
  } catch (e) {
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    console.error(e);
    return { error: t('errGeneric') };
  }
  if (str(formData, 'next') === 'another') {
    const keep = new URLSearchParams({ type: v.type, brand: v.brand, zone: v.zone, ih: v.interval_hours ?? '', im: v.interval_months ?? '', partner: v.partner, ok: 'tSaved', v: v.id });
    redirect(`/equipment/new?${keep}`);
  }
  redirect(`/equipment/${q(v.id)}?ok=tSaved&v=${q(v.id)}`);
}

export async function deleteAsset(formData) {
  const user = await requireUser();
  if (!can(user, 'asset.delete')) redirect('/equipment');
  const id = str(formData, 'id');
  const s = await db();
  const [before] = await s('select * from assets where id = $1', [id]);
  if (before) {
    await s(`delete from part_lines where (parent_kind = 'event' and parent_id in (select id::text from service_events where asset_id = $1))
             or (parent_kind = 'wo' and parent_id in (select number from work_orders where asset_id = $1))`, [id]);
    await s('delete from assets where id = $1', [id]);
    await audit(s, user.id, 'asset', id, 'delete', before, null);
  }
  redirect(`/equipment?ok=tDeleted&v=${q(id)}`);
}

/* ---------- People ---------- */
const ROLES = ['admin', 'ops', 'engineer', 'operator'];

export async function addPerson(formData) {
  const user = await requireUser();
  if (!can(user, 'people')) redirect('/equipment');
  const name = str(formData, 'name').replace(/\s+/g, ' ');
  const role = ROLES.includes(str(formData, 'role')) ? str(formData, 'role') : 'operator';
  const title = str(formData, 'title');
  const pin = str(formData, 'pin');
  const back = (e, v = '') => redirect(`/people?e=${e}&v=${q(v)}&fn=${q(name)}&fr=${role}&ft=${q(title)}`);
  if (!name) back('errNameRequired');
  if (!PIN_RE.test(pin)) back('errPinFormat');
  const s = await db();
  const [dup] = await s('select id, active from people where lower(name) = lower($1)', [name]);
  if (dup && dup.active) back('errNameTaken', name);
  const hash = await bcrypt.hash(pin, 10);
  if (dup) {
    await s('update people set active = true, role = $1, title = $2, pin_hash = $3, failed_attempts = 0, locked_until = null where id = $4', [role, title, hash, dup.id]);
    await audit(s, user.id, 'person', dup.id, 'reactivate', null, { name, role, title });
  } else {
    const [r] = await s('insert into people (name, role, title, pin_hash) values ($1,$2,$3,$4) returning id', [name, role, title, hash]);
    await audit(s, user.id, 'person', r.id, 'create', null, { name, role, title });
  }
  redirect(`/people?ok=tPersonAdded&v=${q(name)}`);
}

export async function changePin(formData) {
  const user = await requireUser();
  const id = Number(str(formData, 'id'));
  const isSelf = id === user.id;
  if (!isSelf && !can(user, 'people')) redirect('/equipment');
  const pin = str(formData, 'pin');
  const s = await db();
  const [p] = await s('select * from people where id = $1', [id]);
  if (!p) redirect('/people');
  if (!PIN_RE.test(pin)) redirect(`/people?e=errPinFormat`);
  if (isSelf && p.pin_hash) {
    const cur = str(formData, 'current');
    if (!(await bcrypt.compare(cur, p.pin_hash))) redirect(`/people?e=errWrongCurrent`);
  }
  await s('update people set pin_hash = $1, failed_attempts = 0, locked_until = null where id = $2', [await bcrypt.hash(pin, 10), id]);
  await audit(s, user.id, 'person', id, isSelf ? 'change_own_pin' : 'reset_pin', null, null);
  redirect(`/people?ok=tPinChanged&v=${q(p.name)}`);
}

export async function removePerson(formData) {
  const user = await requireUser();
  if (!can(user, 'people')) redirect('/equipment');
  const id = Number(str(formData, 'id'));
  if (id === user.id) redirect('/people?e=errSelf');
  const s = await db();
  const [p] = await s('select name from people where id = $1', [id]);
  if (p) {
    await s('update people set active = false where id = $1', [id]);
    await audit(s, user.id, 'person', id, 'remove', { name: p.name }, null);
  }
  redirect(`/people?ok=tRemoved&v=${q(p?.name || '')}`);
}

export async function unlockPerson(formData) {
  const user = await requireUser();
  if (!can(user, 'people')) redirect('/equipment');
  const id = Number(str(formData, 'id'));
  const s = await db();
  const [p] = await s('update people set failed_attempts = 0, locked_until = null where id = $1 returning name', [id]);
  await audit(s, user.id, 'person', id, 'unlock', null, null);
  redirect(`/people?ok=tUnlocked&v=${q(p?.name || '')}`);
}

/* ---------- Settings ---------- */
const lines = (txt) => [...new Set(String(txt || '').split('\n').map((x) => x.trim()).filter(Boolean))];
const int = (x, d) => { const n = parseInt(String(x), 10); return Number.isFinite(n) && n >= 0 ? n : d; };

export async function saveSettings(formData) {
  const user = await requireUser();
  if (!can(user, 'settings')) redirect('/equipment');
  const before = await getSettings();
  const intervals = {};
  for (const ty of TYPES) intervals[ty] = { h: int(str(formData, `ih_${ty}`), 0), m: int(str(formData, `im_${ty}`), 0) };
  const parts = lines(str(formData, 'parts')).map((ln) => {
    const [name, type = '', cost = '0'] = ln.split('|').map((x) => x.trim());
    return { name, type: TYPES.includes(type.toUpperCase()) ? type.toUpperCase() : '', cost: int(cost.replace(/,/g, ''), 0) };
  }).filter((p) => p.name);
  const data = {
    ...before,
    company: { name: str(formData, 'cname'), address: str(formData, 'address'), phone: str(formData, 'phone'), email: str(formData, 'email') },
    currency: ['EGP', 'USD', 'EUR', 'SAR', 'AED'].includes(str(formData, 'currency')) ? str(formData, 'currency') : 'EGP',
    dateFormat: ['long', 'dmy', 'iso'].includes(str(formData, 'dateFormat')) ? str(formData, 'dateFormat') : 'long',
    dueSoonDays: Math.min(int(str(formData, 'dueSoonDays'), 14), 365),
    hourDueSoonPct: Math.min(Math.max(int(str(formData, 'hourDueSoonPct'), 90), 50), 100),
    intervals, zones: lines(str(formData, 'zones')), cats: lines(str(formData, 'cats')), parts,
  };
  const s = await db();
  await s('update settings set data = $1 where id = 1', [JSON.stringify(data)]);
  await audit(s, user.id, 'settings', 1, 'update', before, data);
  redirect('/settings?ok=tSettings');
}
