import { db, getSettings } from '@/lib/db';
import { requireUser, can } from '@/lib/auth';
import { getT } from '@/lib/i18n';
import { TYPES } from '@/lib/rules';
import AssetForm from '@/components/AssetForm';
import NoAccess from '@/components/NoAccess';
import Toast from '@/components/Toast';
import { formProps } from '../formProps';

export const dynamic = 'force-dynamic';

export default async function NewEquipment({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser();
  const { t } = await getT();
  if (!can(user, 'asset.add')) return <NoAccess t={t} />;
  const s = await db();
  const st = await getSettings();
  const ids = await s('select id from assets');
  const nextIds = {};
  for (const ty of TYPES) {
    const re = new RegExp(`^${ty}-(\\d+)$`);
    const max = ids.reduce((m, r) => { const x = re.exec(r.id); return x ? Math.max(m, +x[1]) : m; }, 0);
    nextIds[ty] = `${ty}-${String(max + 1).padStart(2, '0')}`;
  }
  const type = TYPES.includes(sp.type) ? sp.type : 'FL';
  const initial = {
    type, id: nextIds[type], brand: sp.brand || '', model: '', serial: '', zone: sp.zone || '', year: '',
    purchased: '', warranty: '', hours: '', last_meter: '', interval_hours: sp.ih || '', interval_months: sp.im || '',
    last_service: '', next_service: '', partner: sp.partner || '', status: 'operational',
  };
  const props = await formProps(s, st, t);
  return (
    <>
      <div className="card-head"><h1>{t('nav_add')}</h1></div>
      <AssetForm key={sp.v || 'new'} mode="add" initial={initial} nextIds={nextIds} cancelHref="/equipment" {...props} />
      <Toast msg={sp.ok ? t(sp.ok, { id: sp.v || '' }) : null} />
    </>
  );
}
