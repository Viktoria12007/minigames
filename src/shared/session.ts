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

function isValidSession(value: unknown, now: number): value is AppSession {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
  }
  const candidate = value as Partial<AppSession>;
  return (
    typeof candidate.displayName === 'string' &&
    typeof candidate.email === 'string' &&
    candidate.email.length > 0 &&
    typeof candidate.authenticatedAt === 'number' &&
    Number.isFinite(candidate.authenticatedAt) &&
    candidate.authenticatedAt <= now &&
    (candidate.avatarUrl === undefined || typeof candidate.avatarUrl === 'string')
  );
}

function notifySessionChange(session?: AppSession): void {
  dispatchEvent(
    new CustomEvent<AppSession | undefined>('minigames:sessionchange', { detail: session }),
  );
}

function removeSessionAndSignOut(): void {
  localStorage.removeItem(appSessionKey);
  notifySessionChange();
  void signOutFirebase().catch(() => null);
}

export function createAppSession(user: User): AppSession {
  const email = user.email;
  if (!email) {
      throw new Error('The authentication provider did not return an email address.');
  }
  const session: AppSession = {
    displayName: user.displayName ?? '',
    email,
    authenticatedAt: Date.now(),
    ...(user.photoURL && { avatarUrl: user.photoURL }),
  };
  localStorage.setItem(appSessionKey, JSON.stringify(session));
  notifySessionChange(session);
  return session;
}

export function checkAppSession(now = Date.now()): SessionCheck {
  const rawSession = localStorage.getItem(appSessionKey);
  if (!rawSession) {
      return { status: 'guest' };
  }
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

export async function clearAppSession(): Promise<void> {
  localStorage.removeItem(appSessionKey);
  notifySessionChange();
  await signOutFirebase();
}
