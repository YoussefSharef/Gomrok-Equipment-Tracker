export function StatusPill({ status, t }) {
  return <span className={`pill dot st-${status}`}>{t('st_' + status)}</span>;
}
export function ServicePill({ state, t }) {
  return <span className={`pill sv-${state}`}>{t('sv_' + state)}</span>;
}
