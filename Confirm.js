'use client';
import { useRef } from 'react';

// Native <dialog>: traps focus, closes on Esc, returns focus to the trigger.
export default function Confirm({ trigger, triggerClass = 'btn btn-t', title, body, confirm, cancel, action, hidden = {} }) {
  const ref = useRef(null);
  return (
    <>
      <button type="button" className={triggerClass} onClick={() => ref.current?.showModal()}>{trigger}</button>
      <dialog ref={ref} onClick={(e) => { if (e.target === ref.current) ref.current.close(); }} aria-labelledby="dlg-title">
        <h2 id="dlg-title">{title}</h2>
        <p>{body}</p>
        <form action={action} className="d-acts">
          {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <button type="button" className="btn btn-t" autoFocus onClick={() => ref.current?.close()}>{cancel}</button>
          <button type="submit" className="btn btn-d">{confirm}</button>
        </form>
      </dialog>
    </>
  );
}
