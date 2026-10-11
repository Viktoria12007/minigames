import { jest } from '@jest/globals';

const signOutFirebase = jest.fn<() => Promise<void>>().mockResolvedValue();
jest.unstable_mockModule('./firebase', () => ({ signOutFirebase }));
const session = await import('./session');

const user = { email: 'player@example.com', displayName: 'Player', photoURL: 'avatar.png' };

describe('application session', () => {
  beforeEach(() => {
    localStorage.clear();
    signOutFirebase.mockClear();
  });

  it('creates a persisted session and notifies listeners', () => {
    const listener = jest.fn();
    addEventListener('minigames:sessionchange', listener, { once: true });
    const result = session.createAppSession(user as never);
    expect(result).toMatchObject({
      email: user.email,
      displayName: 'Player',
      avatarUrl: 'avatar.png',
    });
    expect(session.checkAppSession()).toMatchObject({
      status: 'active',
      session: { email: user.email },
    });
    expect(listener).toHaveBeenCalled();
  });

  it('rejects missing user email', () => {
    expect(() => session.createAppSession({ ...user, email: null } as never)).toThrow(
      'did not return an email',
    );
  });

  it('removes invalid and expired sessions and signs Firebase out', async () => {
    localStorage.setItem(session.appSessionKey, '{broken');
    expect(session.checkAppSession()).toEqual({ status: 'invalid' });
    await Promise.resolve();
    expect(signOutFirebase).toHaveBeenCalled();

    localStorage.setItem(
      session.appSessionKey,
      JSON.stringify({ displayName: 'P', email: user.email, authenticatedAt: 10 }),
    );
    expect(session.checkAppSession(10 + session.appSessionDuration)).toEqual({ status: 'expired' });
  });

  it('clears local and Firebase sessions on logout', async () => {
    session.createAppSession(user as never);
    await session.clearAppSession();
    expect(localStorage.getItem(session.appSessionKey)).toBeNull();
    expect(signOutFirebase).toHaveBeenCalled();
  });
});
