import { notFound } from 'next/navigation';
import { db, getSettings } from '@/lib/db';
import { requireUser, can } from '@/lib/auth';
import { getT } from '@/lib/i18n';
import AssetForm from '@/components/AssetForm';
import NoAccess from '@/components/NoAccess';
import { formProps } from '../../formProps';

export const dynamic = 'force-dynamic';

export default async function EditEquipment({ params }) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw);
  const user = await requireUser();
  const { t } = await getT();
  if (!can(user, 'asset.edit')) return <NoAccess t={t} />;
  const s = await db();
  const [a] = await s('select * from assets where id = $1', [id]);
  if (!a) notFound();
  const st = await getSettings();
  const initial = Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v == null ? '' : typeof v === 'object' ? '' : String(v)]));
  const props = await formProps(s, st, t);
  return (
    <>
      <div className="card-head"><h1>{t('editTitle', { id })}</h1></div>
      <AssetForm mode="edit" initial={initial} cancelHref={`/equipment/${encodeURIComponent(id)}`} {...props} />
    </>
  );
}
