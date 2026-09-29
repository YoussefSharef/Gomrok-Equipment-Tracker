'use client';
import { useActionState, useState } from 'react';
import { saveAsset } from '@/app/actions';

export default function AssetForm({ mode, initial, L, types, statuses, zones, partners, intervals, nextIds, cancelHref }) {
  const [state, action, pending] = useActionState(saveAsset, null);
  const [v, setV] = useState(initial);
  const [idTouched, setIdTouched] = useState(mode === 'edit');
  const set = (k) => (e) => {
    const val = e.target.value;
    setV((o) => {
      const n = { ...o, [k]: val };
      if (k === 'type' && !idTouched && nextIds) n.id = nextIds[val] || '';
      return n;
    });
    if (k === 'id') setIdTouched(true);
  };
  const def = intervals[v.type] || {};
  const inp = (k, label, { type = 'text', req, help, cls = '', list, data, ...rest } = {}) => (
    <div className={'field ' + cls}>
      <label htmlFor={'f-' + k}>{label}{req && <span className="req"> *</span>}</label>
      <input id={'f-' + k} name={k} type={type} value={v[k] ?? ''} onChange={set(k)} list={list}
        className={data ? 'data' : ''} dir={data || type === 'date' ? 'ltr' : undefined} {...rest} />
      {help && <span className="help">{help}</span>}
    </div>
  );

  return (
    <form action={action} className="card" noValidate>
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" defaultValue="" />
      {mode === 'edit' && <input type="hidden" name="orig" value={initial.id} />}
      <fieldset>
        <legend>{L.sec_identity}</legend>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-type">{L.f_type}<span className="req"> *</span></label>
            <select id="f-type" name="type" value={v.type} onChange={set('type')}>
              {types.map((ty) => <option key={ty.code} value={ty.code}>{ty.name} ({ty.code})</option>)}
            </select>
          </div>
          {inp('id', L.f_id, { req: true, help: L.h_id, data: true, readOnly: mode === 'edit', autoComplete: 'off' })}
          {inp('zone', L.f_zone, { list: 'zones-list' })}
          {mode === 'edit' ? (
            <div className="field">
              <label htmlFor="f-status">{L.f_status}</label>
              <select id="f-status" name="status" value={v.status} onChange={set('status')}>
                {statuses.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
          ) : <div />}
          {inp('brand', L.f_brand, { req: true, dir: 'ltr' })}
          {inp('model', L.f_model, { dir: 'ltr' })}
          {inp('serial', L.f_serial, { req: true, data: true })}
          {inp('year', L.f_year, { type: 'number', data: true, min: 1990, max: 2100 })}
          <div className="span4 help">{L.h_brandSerial}</div>
        </div>
      </fieldset>
      <fieldset>
        <legend>{L.sec_record}</legend>
        <div className="form-grid">
          {inp('purchased', L.f_purchased, { type: 'date' })}
          {inp('warranty', L.f_warranty, { type: 'date' })}
          {inp('partner', L.f_partner, { list: 'partner-list', cls: 'span2' })}
        </div>
      </fieldset>
      <fieldset>
        <legend>{L.sec_plan}</legend>
        <div className="form-grid">
          {inp('interval_hours', L.f_planH, { type: 'number', data: true, min: 0, placeholder: def.h ? String(def.h) : '' })}
          {inp('interval_months', L.f_planM, { type: 'number', data: true, min: 0, placeholder: def.m ? String(def.m) : '' })}
          {inp('hours', L.f_hours, { type: 'number', data: true, min: 0, step: 'any' })}
          {inp('last_meter', L.f_lastMeter, { type: 'number', data: true, min: 0, step: 'any' })}
          <div className="span2 help" style={{ marginTop: -8 }}>{L.h_plan.replace('{h}', def.h || '—').replace('{m}', def.m || '—')}</div>
          <div className="span2" />
          {inp('last_service', L.f_lastService, { type: 'date' })}
          {inp('next_service', L.f_nextService, { type: 'date', help: L.h_next, cls: 'span2' })}
        </div>
      </fieldset>
      <datalist id="zones-list">{zones.map((z) => <option key={z} value={z} />)}</datalist>
      <datalist id="partner-list">{partners.map((z) => <option key={z} value={z} />)}</datalist>
      {state?.error && <div className="err" role="alert">{state.error}</div>}
      <div className="form-actions">
        <button type="submit" className="btn btn-p" disabled={pending} onClick={(e) => { e.currentTarget.form.elements.next.value = ''; }}>{mode === 'edit' ? L.saveChanges : L.saveAsset}</button>
        {mode !== 'edit' && <button type="submit" className="btn btn-s" disabled={pending} onClick={(e) => { e.currentTarget.form.elements.next.value = 'another'; }}>{L.saveAnother}</button>}
        <a href={cancelHref} className="btn btn-t">{L.cancel}</a>
      </div>
    </form>
  );
}
