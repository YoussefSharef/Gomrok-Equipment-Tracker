import { db, getSettings } from '@/lib/db';
import { requireUser, can } from '@/lib/auth';
import { getT, fmtDate, fmtMoney, fmtNum } from '@/lib/i18n';
import { TYPES, serviceState, nextDue, todayISO } from '@/lib/rules';
import { StatusPill, ServicePill } from '@/components/Pills';
import Toast from '@/components/Toast';

export const dynamic = 'force-dynamic';

const STATUS_FILTERS = [
  ['pending', 'st_reported', (a) => a.status === 'reported'],
  ['operational', 'st_operational', (a) => a.status === 'operational'],
  ['due', 'sv_due', (a) => a.sv === 'due'],
  ['overdue', 'sv_overdue', (a) => a.sv === 'overdue'],
  ['vendor', 'st_vendor', (a) => a.status === 'vendor'],
  ['out', 'sv_out', (a) => a.sv === 'out'],
];

export default async function Equipment({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser();
  const { t, lang } = await getT();
  const st = await getSettings();
  const s = await db();
  const rows = await s(`select a.*, coalesce(c.cost, 0)::int as cost from assets a
    left join (select asset_id, sum(cost) as cost from service_events group by asset_id) c on c.asset_id = a.id
    order by a.type, a.id`);
  const today = todayISO();
  const all = rows.map((a) => ({ ...a, sv: serviceState(a, st, today), nd: nextDue(a, st) }));
  const showCost = can(user, 'costs');

  const f = { q: (sp.q || '').trim().toLowerCase(), zone: sp.zone || '', type: sp.type || '', status: sp.status || '' };
  const statusFn = STATUS_FILTERS.find((x) => x[0] === f.status)?.[2];
  const list = all.filter((a) =>
    (!f.q || [a.id, a.serial, a.brand, a.model, a.zone].some((x) => (x || '').toLowerCase().includes(f.q))) &&
    (!f.zone || a.zone === f.zone) && (!f.type || a.type === f.type) && (!statusFn || statusFn(a)));

  const link = (patch) => {
    const p = new URLSearchParams(Object.entries({ ...f, q: sp.q || '', ...patch }).filter(([, v]) => v));
    const s2 = p.toString(); return '/equipment' + (s2 ? '?' + s2 : '');
  };
  const zones = [...new Set([...(st.zones || []), ...all.map((a) => a.zone).filter(Boolean)])];
  const count = (fn) => all.filter(fn).length;
  const kpis = [
    ['', 'kpi_total', all.length, 'var(--navy)'],
    ['operational', 'kpi_operational', count((a) => a.status === 'operational'), 'var(--ok)'],
    ['due', 'kpi_due', count((a) => a.sv === 'due'), '#E0A800'],
    ['overdue', 'kpi_overdue', count((a) => a.sv === 'overdue'), 'var(--over)'],
    ['out', 'kpi_out', count((a) => a.sv === 'out'), 'var(--out)'],
    ['pending', 'kpi_pending', count((a) => a.status === 'reported'), 'var(--navy)'],
  ];
  const toast = sp.ok ? t(sp.ok, { id: sp.v || '', name: sp.v || '' }) : null;
  const filtered = f.q || f.zone || f.type || f.status;

  return (
    <>
      <div className="card-head"><h1>{t('nav_equipment')}</h1>
        {can(user, 'asset.add') && all.length > 0 && <a className="btn btn-p" href="/equipment/new">{t('nav_add')}</a>}
      </div>
      {all.length === 0 ? (
        <div className="empty">
          <h2>{t('emptyTitle')}</h2><p>{t('emptyBody')}</p>
          {can(user, 'asset.add') && <a className="btn btn-p" href="/equipment/new">{t('nav_add')}</a>}
        </div>
      ) : (<>
        <div className="kpis">
          {kpis.map(([key, label, n, c]) => (
            <a key={label} href={link({ status: key })} className={'kpi' + (f.status === key && (key || !filtered) ? ' sel' : '')} style={{ '--kc': c }}>
              <div className="l">{t(label)}</div><div className="v">{n}</div>
              <div className="meta">{key ? t('kpi_filter') : t('kpi_all')}</div>
            </a>
          ))}
        </div>
        <div className="filters">
          <form action="/equipment" style={{ display: 'contents' }}>
            {f.type && <input type="hidden" name="type" value={f.type} />}
            {f.status && <input type="hidden" name="status" value={f.status} />}
            {sp.q && <input type="hidden" name="q" value={sp.q} />}
            <select name="zone" defaultValue={f.zone} aria-label={t('col_zone')}>
              <option value="">{t('allZones')}</option>
              {zones.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <button className="chip" type="submit">{t('apply')}</button>
          </form>
          <span className="sep" />
          <a className={'chip' + (!f.type ? ' on' : '')} href={link({ type: '' })}>{t('allTypes')}</a>
          {TYPES.filter((ty) => all.some((a) => a.type === ty)).map((ty) => (
            <a key={ty} className={'chip' + (f.type === ty ? ' on' : '')} href={link({ type: ty })}>{t('type_' + ty)}</a>
          ))}
          <span className="sep" />
          <a className={'chip' + (!f.status ? ' on' : '')} href={link({ status: '' })}>{t('anyStatus')}</a>
          {STATUS_FILTERS.map(([k, label]) => (
            <a key={k} className={'chip' + (f.status === k ? ' on' : '')} href={link({ status: k })}>{t(label)}</a>
          ))}
          <span className="count meta">{t('shown', { n: list.length })}</span>
        </div>
        {list.length === 0 ? (
          <div className="empty"><h2>{t('noMatchTitle')}</h2><p>{t('noMatchBody')}</p>
            <a className="btn btn-p" href="/equipment">{t('clearFilters')}</a></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr>
                <th>{t('col_id')}</th><th>{t('col_type')}</th><th>{t('col_brand')}</th><th>{t('col_serial')}</th>
                <th>{t('col_zone')}</th><th className="r">{t('col_meter')}</th><th>{t('col_status')}</th>
                <th>{t('col_service')}</th><th>{t('col_next')}</th>{showCost && <th className="r">{t('col_cost')}</th>}
              </tr></thead>
              <tbody>
                {list.map((a) => { const h = `/equipment/${encodeURIComponent(a.id)}`; return (
                  <tr key={a.id}>
                    <td><a href={h} className="id">{a.id}</a></td>
                    <td><a href={h} tabIndex={-1}>{t('type_' + a.type)}</a></td>
                    <td><a href={h} tabIndex={-1} className="latin">{[a.brand, a.model].filter(Boolean).join(' ') || '—'}</a></td>
                    <td><a href={h} tabIndex={-1}><span className="num">{a.serial || '—'}</span></a></td>
                    <td><a href={h} tabIndex={-1}>{a.zone || '—'}</a></td>
                    <td className="r"><a href={h} tabIndex={-1}><span className="num">{fmtNum(a.hours)}</span></a></td>
                    <td><a href={h} tabIndex={-1}><StatusPill status={a.status} t={t} /></a></td>
                    <td><a href={h} tabIndex={-1}><ServicePill state={a.sv} t={t} /></a></td>
                    <td><a href={h} tabIndex={-1}>{fmtDate(a.nd, lang, st.dateFormat)}</a></td>
                    {showCost && <td className="r"><a href={h} tabIndex={-1}><span className="num">{fmtMoney(a.cost, st.currency)}</span></a></td>}
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
        )}
      </>)}
      <Toast msg={toast} />
    </>
  );
}
