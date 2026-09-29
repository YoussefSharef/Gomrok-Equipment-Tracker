import { TYPES, STATUSES } from '@/lib/rules';

const KEYS = ['sec_identity', 'sec_record', 'sec_plan', 'f_type', 'f_id', 'f_zone', 'f_brand', 'f_model', 'f_year', 'f_serial',
  'f_purchased', 'f_warranty', 'f_hours', 'f_lastMeter', 'f_planH', 'f_planM', 'f_lastService', 'f_nextService', 'f_partner',
  'f_status', 'h_id', 'h_plan', 'h_next', 'h_brandSerial', 'saveAsset', 'saveAnother', 'saveChanges', 'cancel'];

export async function formProps(s, st, t) {
  const L = Object.fromEntries(KEYS.map((k) => [k, t(k)]));
  const vendors = await s('select name from vendors where not archived order by name');
  const used = await s(`select distinct zone from assets where zone <> ''`);
  return {
    L,
    types: TYPES.map((code) => ({ code, name: t('type_' + code) })),
    statuses: STATUSES.map((code) => ({ code, name: t('st_' + code) })),
    zones: [...new Set([...(st.zones || []), ...used.map((r) => r.zone)])],
    partners: vendors.map((r) => r.name),
    intervals: st.intervals || {},
  };
}
