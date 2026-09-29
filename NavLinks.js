'use client';
import { usePathname } from 'next/navigation';
import { IcEquipment, IcAdd, IcPeople, IcSettings } from './Icons';
const ICONS = { equipment: IcEquipment, add: IcAdd, people: IcPeople, settings: IcSettings };
export default function NavLinks({ items }) {
  const path = usePathname();
  const active = (h) => h === '/equipment' ? path === h || (/^\/equipment\/(?!new)/.test(path)) : path.startsWith(h);
  return (
    <nav className="nav">
      {items.map((it) => { const I = ICONS[it.key]; return (
        <a key={it.href} href={it.href} className={active(it.href) ? 'on' : ''} aria-current={active(it.href) ? 'page' : undefined}><I />{it.label}</a>
      ); })}
    </nav>
  );
}
