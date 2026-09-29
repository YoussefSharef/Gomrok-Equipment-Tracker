import { headers } from 'next/headers';
import { requireUser, can } from '@/lib/auth';
import { getT, fmtDate } from '@/lib/i18n';
import { todayISO } from '@/lib/rules';
import { logout } from '@/app/actions';
import LangSwitch from '@/components/LangSwitch';
import NavLinks from '@/components/NavLinks';
import { IcOut } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function Shell({ children }) {
  const user = await requireUser();
  const { t, lang } = await getT();
  const items = [
    { href: '/equipment', key: 'equipment', label: t('nav_equipment') },
    can(user, 'asset.add') && { href: '/equipment/new', key: 'add', label: t('nav_add') },
    can(user, 'people') && { href: '/people', key: 'people', label: t('nav_people') },
    can(user, 'settings') && { href: '/settings', key: 'settings', label: t('nav_settings') },
  ].filter(Boolean);
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><div className="brand-mark">G</div><div><b>{t('company')}</b><small>{t('appName')}</small></div></div>
        <NavLinks items={items} />
        <div className="soon"><b>{t('soonTitle')}</b>{t('soonBody')}</div>
        <div className="me">
          <b>{user.name}</b><small>{t('role_' + user.role)}{user.title && user.title !== t('role_' + user.role) ? ` · ${user.title}` : ''}</small>
          <form action={logout}><button type="submit"><IcOut />{t('signOut')}</button></form>
        </div>
      </aside>
      <div className="main">
        <header className="top">
          <span className="date">{fmtDate(todayISO(), lang, 'long')}</span>
          <div className="grow" />
          <form action="/equipment" className="top-search" role="search">
            <input name="q" type="search" placeholder={t('search')} aria-label={t('search')} />
          </form>
          <LangSwitch lang={lang} label={t('switchLang')} />
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
