import { notFound } from 'next/navigation';
import { db, getSettings } from '@/lib/db';
import { requireUser, can } from '@/lib/auth';
import { getT, fmtDate, fmtMoney, fmtNum } from '@/lib/i18n';
import { serviceState, nextDue, plan, hourProgress, todayISO, daysBetween } from '@/lib/rules';
import { StatusPill, ServicePill } from '@/components/Pills';
import Confirm from '@/components/Confirm';
import Toast from '@/components/Toast';
import { deleteAsset } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function Detail({ params, searchParams }) {
  const { id: raw } = await params;
  const sp = await searchParams;
  const id = decodeURIComponent(raw);
  const user = await requireUser();
  const { t, lang } = await getT();
  const s = await db();
  const [a] = await s(`select a.*, c.name as created_name, u.name as updated_name from assets a
    left join people c on c.id = a.created_by left join people u on u.id = a.updated_by where a.id = $1`, [id]);
  if (!a) notFound();
  const st = await getSettings();
  const events = await s('select * from service_events where asset_id = $1 order by date desc, id desc', [id]);
  const today = todayISO();
  const sv = serviceState(a, st, today);
  const nd = nextDue(a, st);
  const p = plan(a, st);
  const hp = hourProgress(a, st);
  const d = (x) => fmtDate(x, lang, st.dateFormat);
  const showCost = can(user, 'costs');
  const costAll = events.reduce((n, e) => n + (e.cost || 0), 0);
  const yearStart = today.slice(0, 4) + '-01-01';
  const costYear = events.filter((e) => e.date >= yearStart).reduce((n, e) => n + (e.cost || 0), 0);
  const breakdowns = events.filter((e) => e.kind === 'breakdown').length;
  const since = a.purchased || (a.created_at ? new Date(a.created_at).toISOString().slice(0, 10) : today);
  const mtbf = breakdowns ? Math.round(daysBetween(since, today) / breakdowns) : null;
  const barCls = sv === 'overdue' ? 'bar over' : sv === 'due' ? 'bar due' : 'bar';
  const used = hp != null ? Math.max(0, (a.hours || 0) - (a.last_meter || 0)) : null;

  const spec = [
    ['f_brand', <span className="latin">{a.brand || '—'}</span>], ['f_model', <span className="latin">{a.model || '—'}</span>],
    ['f_type', t('type_' + a.type)], ['f_serial', <span className="num">{a.serial || '—'}</span>],
    ['f_zone', a.zone || '—'], ['f_year', <span className="num">{a.year || '—'}</span>],
    ['f_hours', <span className="num">{fmtNum(a.hours)}</span>], ['f_purchased', d(a.purchased)],
    ['f_warranty', d(a.warranty)],
    ['f_partner', a.partner || '—'],
  ];

  return (
    <>
      <div className="meta" style={{ marginBottom: 10 }}><a href="/equipment" className="linkbtn">{t('back')}</a></div>
      <div className="det-head">
        <div>
          <div className="big-id">{a.id}</div>
          <div className="sub"><span className="latin">{[a.brand, a.model].filter(Boolean).join(' ')}</span>{a.brand || a.model ? ' · ' : ''}{t('type_' + a.type)}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><StatusPill status={a.status} t={t} /><ServicePill state={sv} t={t} /></div>
        </div>
        <div className="acts">
          {can(user, 'asset.edit') && <a className="btn btn-s" href={`/equipment/${encodeURIComponent(a.id)}/edit`}>{t('editDetails')}</a>}
          {can(user, 'asset.delete') && (
            <Confirm trigger={t('del')} title={t('delTitle', { id: a.id })} body={t('delBody', { id: a.id })}
              confirm={t('delConfirm')} cancel={t('cancel')} action={deleteAsset} hidden={{ id: a.id }} />
          )}
        </div>
      </div>

      <div className="kpis-3">
        {showCost && <div className="kpi"><div className="l">{t('k_costToDate')}</div><div className="v" style={{ fontSize: 24 }}><span className="num">{fmtMoney(costAll, st.currency)}</span></div></div>}
        {showCost && <div className="kpi"><div className="l">{t('k_costYear')}</div><div className="v" style={{ fontSize: 24 }}><span className="num">{fmtMoney(costYear, st.currency)}</span></div></div>}
        <div className="kpi"><div className="l">{t('k_faults')}</div><div className="v" style={{ fontSize: 24 }}>{breakdowns}</div></div>
        <div className="kpi"><div className="l">{t('k_mtbf')}</div><div className="v" style={{ fontSize: 24 }}>{mtbf ?? '—'}</div></div>
      </div>

      <div className="cols">
        <div className="stack">
          <section className="card"><div className="card-head"><h2>{t('specs')}</h2></div>
            <dl className="dl">{spec.map(([k, v]) => <div key={k}><dt>{t(k)}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          <section className="card"><div className="card-head"><h2>{t('history')}</h2></div>
            {events.length === 0 ? <p className="muted" style={{ margin: 0 }}>{t('noHistory')}</p> : (
              <table className="tbl-simple"><thead><tr><th>{t('h_date')}</th><th>{t('h_kind')}</th><th>{t('h_what')}</th><th>{t('h_by')}</th>{showCost && <th className="r">{t('h_cost')}</th>}</tr></thead>
                <tbody>{events.map((e) => (
                  <tr key={e.id}><td>{d(e.date)}</td><td>{e.kind}</td><td>{e.title}</td><td>{e.vendor || e.performed_by || '—'}</td>
                    {showCost && <td className="r"><span className="num">{fmtMoney(e.cost, st.currency)}</span></td>}</tr>
                ))}</tbody></table>
            )}
          </section>
        </div>
        <div className="stack">
          <section className="card"><div className="card-head"><h2>{t('planTitle')}</h2></div>
            <dl className="dl" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div><dt>{t('p_next')}</dt><dd>{d(nd)}</dd></div>
              <div><dt>{t('p_last')}</dt><dd>{d(a.last_service)}</dd></div>
            </dl>
            {hp != null && (<>
              <div className={barCls} style={{ marginTop: 16 }}><i style={{ width: Math.min(100, Math.round(hp * 100)) + '%' }} /></div>
              <div className="meta">{t('p_hours', { used: fmtNum(used), h: p.h })}</div>
            </>)}
            <div className="meta" style={{ marginTop: 10 }}>{t('p_interval', { h: p.h || '—', m: p.m || '—' })}</div>
          </section>
          <section className="card"><div className="card-head"><h2>{t('record')}</h2></div>
            <div className="meta">{a.created_name && t('createdBy', { name: a.created_name })}</div>
            {a.updated_name && <div className="meta">{t('updatedBy', { name: a.updated_name })}</div>}
          </section>
        </div>
      </div>
      <Toast msg={sp.ok ? t(sp.ok, { id: sp.v || '' }) : null} />
    </>
  );
}
