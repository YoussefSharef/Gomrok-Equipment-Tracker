import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';

const COOKIE = 'gs';
export const SESSION_HOURS = 10;
export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

function key() {
  return crypto.createHash('sha256')
    .update('gomrok-session:' + (process.env.SESSION_SECRET || process.env.DATABASE_URL || process.env.POSTGRES_URL || ''))
    .digest();
}

export function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', key()).update(body).digest('base64url');
  return body + '.' + mac;
}

function verifyToken(tok) {
  if (!tok || !tok.includes('.')) return null;
  const [body, mac] = tok.split('.');
  const good = crypto.createHmac('sha256', key()).update(body).digest('base64url');
  const a = Buffer.from(mac); const b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}

export async function startSession(personId) {
  const jar = await cookies();
  jar.set(COOKIE, signToken({ pid: personId, exp: Date.now() + SESSION_HOURS * 3600e3 }), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_HOURS * 3600,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser() {
  const p = verifyToken((await cookies()).get(COOKIE)?.value);
  if (!p) return null;
  const s = await db();
  const r = await s('select id, name, role, title, active from people where id = $1', [p.pid]);
  return r[0] && r[0].active ? r[0] : null;
}

export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect('/login');
  return u;
}

// Permission matrix from handoff section 2, enforced on the server.
const PERMS = {
  'asset.add': ['admin', 'ops'],
  'asset.edit': ['admin', 'ops', 'engineer'],
  'asset.delete': ['admin'],
  'people': ['admin'],
  'settings': ['admin'],
  'costs': ['admin', 'ops', 'engineer'],
};
export function can(user, perm) {
  return !!user && (PERMS[perm] || []).includes(user.role);
}
