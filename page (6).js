import { db } from '@/lib/db';
import { requireUser, can } from '@/lib/auth';
import { getT } from '@/lib/i18n';
import { addPerson, changePin, removePerson, unlockPerson } from '@/app/actions';
import Confirm from '@/components/Confirm';
import NoAccess from '@/components/NoAccess';
import Toast from '@/components/Toast';

export const dynamic = 'force-dynamic';
const ROLES = ['admin', 'ops', 'engineer', 'operator'];

export default async function People({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser();
  const { t } = await getT();
  if (!can(user, 'people')) return <NoAccess t={t} />;
  const s = await db();
  const people = await s(`select id, name, role, title, pin_hash is not null as has_pin, locked_until > now() as locked
    from people where active order by case role when 'admin' then 0 when 'ops' then 1 when 'engineer' then 2 else 3 end, name`);
  const err = sp.e ? t(sp.e, { name: sp.v || '' }) : null;
  const pinInput = (name, label) => (
    <input name={name} type="password" inputMode="numeric" maxLength={4} placeholder="••••" aria-label={label} className="pin-in" style={{ fontSize: 14, letterSpacing: '.3em' }} />
  );
  return (
    <>
      <div className="card-head"><div><h1>{t('nav_people')}</h1><p className="muted" style={{ margin: '4px 0 0' }}>{t('peopleIntro')}</p></div></div>
      {err && <div className="err" role="alert">{err}</div>}
      <div className="tbl-wrap" style={{ marginBottom: 18 }}>
        <table className="tbl-simple">
          <thead><tr><th>{t('c_name')}</th><th>{t('c_role')}</th><th>{t('c_title')}</th><th>{t('c_access')}</th><th /></tr></thead>
          <tbody>{people.map((p) => { const self = p.id === user.id; return (
            <tr key={p.id}>
              <td><b style={{ color: 'var(--tx)' }}>{p.name}</b> {self && <span className="tag">{t('you')}</span>}</td>
              <td>{t('role_' + p.role)}</td>
              <td>{p.title || '—'}</td>
              <td>{p.locked ? <span className="tag warn">{t('locked')}</span> : !p.has_pin ? <span className="tag warn">{t('noPinYet')}</span> : '✓'}</td>
              <td>
                <div className="row-actions">
                  {p.locked && <form action={unlockPerson}><input type="hidden" name="id" value={p.id} /><button className="linkbtn">{t('unlock')}</button></form>}
                  <details className="pinbox">
                    <summary>{p.has_pin ? t('changePin') : t('setPin')}</summary>
                    <form action={changePin} className="inline-form" style={{ marginTop: 8 }}>
                      <input type="hidden" name="id" value={p.id} />
                      {self && p.has_pin && pinInput('current', t('currentPin'))}
                      {pinInput('pin', t('newPin'))}
                      <button className="btn btn-s btn-sm">{t('saveChanges')}</button>
                    </form>
                  </details>
                  {!self && <Confirm trigger={t('remove')} triggerClass="linkbtn danger" title={t('removeTitle', { name: p.name })}
                    body={t('removeBody', { name: p.name })} confirm={t('removeConfirm')} cancel={t('cancel')} action={removePerson} hidden={{ id: p.id }} />}
                </div>
              </td>
            </tr>
          ); })}</tbody>
        </table>
      </div>
      <form action={addPerson} className="card">
        <div className="card-head"><h2>{t('addPerson')}</h2></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="p-name">{t('p_name')}<span className="req"> *</span></label><input id="p-name" name="name" defaultValue={sp.fn || ''} /></div>
          <div className="field"><label htmlFor="p-role">{t('p_role')}</label>
            <select id="p-role" name="role" defaultValue={sp.fr || 'engineer'}>{ROLES.map((r) => <option key={r} value={r}>{t('role_' + r)}</option>)}</select></div>
          <div className="field"><label htmlFor="p-title">{t('p_title')}</label><input id="p-title" name="title" defaultValue={sp.ft || ''} /></div>
          <div className="field"><label htmlFor="p-pin">{t('p_pin')}<span className="req"> *</span></label>
            <input id="p-pin" name="pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••" className="pin-in" style={{ fontSize: 14 }} />
            <span className="help">{t('pinHint')}</span></div>
        </div>
        <div className="form-actions"><button className="btn btn-p">{t('addPerson')}</button></div>
      </form>
      <Toast msg={sp.ok ? t(sp.ok, { name: sp.v || '' }) : null} />
    </>
  );
}
