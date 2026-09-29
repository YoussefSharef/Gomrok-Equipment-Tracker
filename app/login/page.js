import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { getT } from '@/lib/i18n';
import { login } from '@/app/actions';
import LangSwitch from '@/components/LangSwitch';

export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }) {
  const sp = await searchParams;
  const { t, lang } = await getT();
  let people = [], firstRun = false, dbErr = false;
  try {
    if (await currentUser()) redirect('/equipment');
    const s = await db();
    people = await s('select id, name, role, pin_hash is not null as has_pin from people where active order by name');
    firstRun = !people.some((p) => p.has_pin);
  } catch (e) {
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    dbErr = true;
  }
  const choices = firstRun ? people.filter((p) => p.role === 'admin') : people;
  let err = null;
  if (sp.e) {
    const until = sp.until ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB',
      { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo' }).format(new Date(sp.until)) : '';
    err = t(sp.e, { n: sp.n ?? '', time: until });
  }
  return (
    <main className="login">
      <div className="lang-corner"><LangSwitch lang={lang} label={t('switchLang')} className="" /></div>
      <form action={login} className="login-card">
        <div className="brand-mark">G</div>
        <h1>{t('appName')}</h1>
        <p>{t('signInTo')}</p>
        {dbErr && <div className="err" role="alert">{t('errNoDb')}</div>}
        {firstRun && !dbErr && <div className="ok-note" style={{ marginBottom: 14 }}>{t('firstRun')}</div>}
        <div className="field">
          <label htmlFor="person">{t('name')}</label>
          <select id="person" name="person" defaultValue={sp.p || ''} required>
            <option value="" disabled>{t('selectName')}</option>
            {choices.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pin">{t('pin')}</label>
          <input id="pin" name="pin" type="password" inputMode="numeric" pattern="\d{4}" maxLength={4}
            autoComplete="off" className="pin-in" placeholder="••••" aria-describedby="pin-help" />
          <span id="pin-help" className="help">{t('pinHint')}</span>
        </div>
        {firstRun && (
          <div className="field">
            <label htmlFor="confirm">{t('confirmPin')}</label>
            <input id="confirm" name="confirm" type="password" inputMode="numeric" maxLength={4} autoComplete="off" className="pin-in" placeholder="••••" />
          </div>
        )}
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn btn-p" type="submit" disabled={dbErr}>{firstRun ? t('firstRunBtn') : t('signIn')}</button>
      </form>
    </main>
  );
}
