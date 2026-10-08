import type { User } from 'firebase/auth';
import { signOutFirebase } from './firebase';

export const appSessionKey = 'minigames:viktoria12007:app-session';
export const appSessionDuration = 5 * 60 * 1000;

export type AppSession = {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
};

export type SessionStatus = 'active' | 'expired' | 'invalid' | 'guest';

export type SessionCheck = {
  status: SessionStatus;
  session?: AppSession;
};

function fallbackDisplayName(email: string): string {
  const localPart = email.split('@', 1)[0] || 'Player';
  return localPart.slice(0, 30).padEnd(2, 'x');
}

function isValidSession(value: unknown, now: number): value is AppSession {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<AppSession>;
  return (
    typeof candidate.displayName === 'string' &&
    candidate.displayName.length > 0 &&
    typeof candidate.email === 'string' &&
    candidate.email.length > 0 &&
    typeof candidate.authenticatedAt === 'number' &&
    Number.isFinite(candidate.authenticatedAt) &&
    candidate.authenticatedAt <= now &&
    (candidate.avatarUrl === undefined || typeof candidate.avatarUrl === 'string')
  );
}

function removeSessionAndSignOut(): void {
  localStorage.removeItem(appSessionKey);
  dispatchEvent(new CustomEvent('minigames:sessionchange'));
  void signOutFirebase();
}

export function createAppSession(user: User): AppSession {
  const email = user.email;
  if (!email) throw new Error('The authentication provider did not return an email address.');
  const session: AppSession = {
    displayName: user.displayName?.trim() || fallbackDisplayName(email),
    email,
    authenticatedAt: Date.now(),
    ...(user.photoURL && { avatarUrl: user.photoURL }),
  };
  localStorage.setItem(appSessionKey, JSON.stringify(session));
  dispatchEvent(new CustomEvent<AppSession>('minigames:sessionchange', { detail: session }));
  return session;
}

export function checkAppSession(now = Date.now()): SessionCheck {
  const rawSession = localStorage.getItem(appSessionKey);
  if (!rawSession) return { status: 'guest' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawSession);
  } catch {
    removeSessionAndSignOut();
    return { status: 'invalid' };
  }
  if (!isValidSession(parsed, now)) {
    removeSessionAndSignOut();
    return { status: 'invalid' };
  }
  if (now - parsed.authenticatedAt >= appSessionDuration) {
    removeSessionAndSignOut();
    return { status: 'expired' };
  }
  return { status: 'active', session: parsed };
}

export function clearAppSession(): void {
  removeSessionAndSignOut();
}
