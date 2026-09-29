import { getSettings } from '@/lib/db';
import { requireUser, can } from '@/lib/auth';
import { getT } from '@/lib/i18n';
import { TYPES } from '@/lib/rules';
import { saveSettings } from '@/app/actions';
import NoAccess from '@/components/NoAccess';
import Toast from '@/components/Toast';

export const dynamic = 'force-dynamic';

export default async function Settings({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser();
  const { t } = await getT();
  if (!can(user, 'settings')) return <NoAccess t={t} />;
  const st = await getSettings();
  const F = ({ id, label, children, help, cls = '' }) => (
    <div className={'field ' + cls}><label htmlFor={id}>{label}</label>{children}{help && <span className="help">{help}</span>}</div>
  );
  return (
    <form action={saveSettings}>
      <div className="card-head"><h1>{t('nav_settings')}</h1><button className="btn btn-p">{t('s_save')}</button></div>
      <div className="stack">
        <section className="card">
          <div className="card-head"><div><h2>{t('s_company')}</h2><span className="meta">{t('s_companyHelp')}</span></div></div>
          <div className="form-grid">
            <F id="cname" label={t('s_cname')}><input id="cname" name="cname" defaultValue={st.company?.name} /></F>
            <F id="address" label={t('s_address')} cls="span2"><input id="address" name="address" defaultValue={st.company?.address} /></F>
            <div />
            <F id="phone" label={t('s_phone')}><input id="phone" name="phone" dir="ltr" defaultValue={st.company?.phone} /></F>
            <F id="email" label={t('s_email')}><input id="email" name="email" type="email" dir="ltr" defaultValue={st.company?.email} /></F>
          </div>
        </section>
        <section className="card">
          <div className="card-head"><h2>{t('s_display')}</h2></div>
          <div className="form-grid">
            <F id="currency" label={t('s_currency')} help={t('s_currencyHelp')}>
              <select id="currency" name="currency" defaultValue={st.currency}>{['EGP', 'USD', 'EUR', 'SAR', 'AED'].map((c) => <option key={c}>{c}</option>)}</select></F>
            <F id="dateFormat" label={t('s_dateFormat')}>
              <select id="dateFormat" name="dateFormat" defaultValue={st.dateFormat}>{['long', 'dmy', 'iso'].map((f) => <option key={f} value={f}>{t('df_' + f)}</option>)}</select></F>
            <F id="dueSoonDays" label={t('s_dueSoon')}><input id="dueSoonDays" name="dueSoonDays" type="number" min="0" max="365" defaultValue={st.dueSoonDays} /></F>
            <F id="hourDueSoonPct" label={t('s_hourPct')}><input id="hourDueSoonPct" name="hourDueSoonPct" type="number" min="50" max="100" defaultValue={st.hourDueSoonPct} /></F>
          </div>
        </section>
        <section className="card">
          <div className="card-head"><div><h2>{t('s_intervals')}</h2><span className="meta">{t('s_intervalsHelp')}</span></div></div>
          <table className="tbl-simple" style={{ maxWidth: 620 }}>
            <thead><tr><th>{t('col_type')}</th><th>{t('s_hours')}</th><th>{t('s_months')}</th></tr></thead>
            <tbody>{TYPES.map((ty) => (
              <tr key={ty}><td>{t('type_' + ty)} <span className="meta num">{ty}</span></td>
                <td><input name={`ih_${ty}`} type="number" min="0" aria-label={`${t('type_' + ty)} ${t('s_hours')}`} defaultValue={st.intervals?.[ty]?.h ?? 0} /></td>
                <td><input name={`im_${ty}`} type="number" min="0" aria-label={`${t('type_' + ty)} ${t('s_months')}`} defaultValue={st.intervals?.[ty]?.m ?? 0} /></td></tr>
            ))}</tbody>
          </table>
        </section>
        <section className="card">
          <div className="card-head"><h2>{t('s_lists')}</h2></div>
          <div className="form-grid">
            <F id="zones" label={t('s_zones')} help={t('s_zonesHelp')}><textarea id="zones" name="zones" defaultValue={(st.zones || []).join('\n')} /></F>
            <F id="cats" label={t('s_cats')} help={t('s_catsHelp')}><textarea id="cats" name="cats" defaultValue={(st.cats || []).join('\n')} /></F>
            <F id="parts" label={t('s_parts')} help={t('s_partsHelp')} cls="span2">
              <textarea id="parts" name="parts" dir="ltr" defaultValue={(st.parts || []).map((p) => `${p.name} | ${p.type} | ${p.cost}`).join('\n')} /></F>
          </div>
          <div className="form-actions"><button className="btn btn-p">{t('s_save')}</button></div>
        </section>
      </div>
      <Toast msg={sp.ok ? t(sp.ok) : null} />
    </form>
  );
}
