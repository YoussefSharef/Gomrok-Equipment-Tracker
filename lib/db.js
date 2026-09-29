import { neon } from '@neondatabase/serverless';

export const DEFAULT_SETTINGS = {
  company: { name: 'Gomrok', address: '', phone: '', email: '' },
  currency: 'EGP',
  dateFormat: 'long',
  dueSoonDays: 14,
  hourDueSoonPct: 90,
  intervals: {
    FL: { h: 500, m: 6 }, RT: { h: 500, m: 6 }, TP: { h: 250, m: 6 }, RS: { h: 0, m: 6 },
    RC: { h: 0, m: 12 }, BT: { h: 0, m: 12 }, CH: { h: 0, m: 12 },
  },
  zones: [],
  cats: [],
  parts: [],
};

const SCHEMA = [
  `create table if not exists people (
    id serial primary key, name text unique not null, role text not null, title text not null default '',
    pin_hash text, active boolean not null default true, failed_attempts int not null default 0,
    locked_until timestamptz, created_at timestamptz not null default now())`,
  `create table if not exists settings (id int primary key default 1, data jsonb not null)`,
  `create table if not exists vendors (
    id serial primary key, name text unique not null, covers text not null default '', contract text not null default 'per_call',
    contact text not null default '', role text not null default '', phone text not null default '', email text not null default '',
    offers jsonb not null default '[]', since text, archived boolean not null default false)`,
  `create table if not exists assets (
    id text primary key, type text not null, brand text not null default '', model text not null default '', year int,
    serial text not null default '', zone text not null default '', hours double precision, last_meter double precision,
    purchased text, warranty text, interval_hours int, interval_months int, last_service text, next_service text,
    partner text not null default '', status text not null default 'operational',
    created_at timestamptz not null default now(), created_by int, updated_at timestamptz not null default now(), updated_by int)`,
  `create table if not exists fault_reports (
    id serial primary key, asset_id text not null references assets(id) on delete cascade, reported_by text, channel text,
    noticed_on text, category text, complaint text, stopped boolean default false, impact text, logged_by int,
    logged_at timestamptz default now(), decision text not null default 'pending', reviewed_by int, reviewed_at timestamptz,
    severity text, priority text)`,
  `create table if not exists work_orders (
    number text primary key, asset_id text not null references assets(id) on delete cascade, fault_report_id int,
    route text, vendor_id int, issue text, sent text, eta text, status text not null default 'open', quoted_cost int,
    closed_by int, closed_at timestamptz, closing_event_id int)`,
  `create table if not exists quotes (
    id serial primary key, work_order text not null references work_orders(number) on delete cascade, company text,
    scope text, price int, lead_days int, note text, awarded boolean not null default false)`,
  `create table if not exists service_events (
    id serial primary key, asset_id text not null references assets(id) on delete cascade, date text not null, kind text not null,
    title text not null default '', descr text, notes text, vendor text, wo text, cost int not null default 0,
    performed_by text, meter double precision, created_by int, created_at timestamptz not null default now())`,
  `create table if not exists part_lines (
    id serial primary key, parent_kind text not null, parent_id text not null, name text not null, qty double precision not null default 1,
    unit_cost int not null default 0, catalogue_id text)`,
  `create table if not exists audit_log (
    id bigserial primary key, at timestamptz not null default now(), person_id int, entity text, entity_id text,
    action text, before jsonb, after jsonb)`,
];

let _sql;
let _ready;

function client() {
  if (!_sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error('NO_DB');
    _sql = neon(url);
  }
  return _sql;
}

async function migrate(s) {
  for (const stmt of SCHEMA) await s(stmt);
  await s('insert into settings (id, data) values (1, $1) on conflict (id) do nothing', [JSON.stringify(DEFAULT_SETTINGS)]);
  await s(`insert into people (name, role, title) values ('Youssef Sharef','admin',''), ('Tarek El Kasaby','admin','IT Manager')
           on conflict (name) do nothing`);
}

export async function db() {
  const s = client();
  if (!_ready) _ready = migrate(s).catch((e) => { _ready = null; throw e; });
  await _ready;
  return s;
}

export async function getSettings() {
  const s = await db();
  const r = await s('select data from settings where id = 1');
  return { ...DEFAULT_SETTINGS, ...(r[0]?.data || {}) };
}

export async function audit(s, personId, entity, entityId, action, before, after) {
  await s('insert into audit_log (person_id, entity, entity_id, action, before, after) values ($1,$2,$3,$4,$5,$6)', [
    personId ?? null, entity, String(entityId), action,
    before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null,
  ]);
}
