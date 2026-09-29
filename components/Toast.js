'use client';
import { useEffect, useState } from 'react';

export default function Toast({ msg }) {
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!msg) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('ok'); url.searchParams.delete('v');
    window.history.replaceState(null, '', url.pathname + url.search);
    const a = setTimeout(() => setHide(true), 2600);
    const b = setTimeout(() => setGone(true), 2900);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [msg]);
  if (!msg || gone) return null;
  return <div className={'toast' + (hide ? ' hide' : '')} role="status">{msg}</div>;
}
