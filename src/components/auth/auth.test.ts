import { jest } from '@jest/globals';

const signInWithEmail = jest.fn<(email: string, password: string) => Promise<unknown>>();
const registerWithEmail =
  jest.fn<(email: string, password: string, username: string) => Promise<unknown>>();
const signInWithGoogle = jest.fn<() => Promise<unknown>>();
const createAppSession = jest.fn<(user: unknown) => unknown>();
const showSnackbar = jest.fn<(text: string, variant: 'success' | 'error') => void>();
jest.unstable_mockModule('../../shared/firebase', () => ({
  signInWithEmail,
  registerWithEmail,
  signInWithGoogle,
}));
jest.unstable_mockModule('../../shared/session', () => ({ createAppSession }));
jest.unstable_mockModule('../snackbar/snackbar', () => ({ showSnackbar }));
const { createAuthModal, initializeAuthModal } = await import('./auth');

const fill = (name: string, value: string) => {
  const input = document
    .querySelector<HTMLFormElement>('.auth__form')
    ?.elements.namedItem(name) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('authentication dialog', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    jest.clearAllMocks();
  });

  it('opens from dynamically rendered auth actions and signs in valid credentials', async () => {
    const modal = createAuthModal();
    document.body.append(modal);
    const controller = initializeAuthModal(modal);
    const trigger = document.createElement('button');
    trigger.dataset.auth = 'login';
    document.body.append(trigger);
    trigger.click();
    expect(controller.isOpenFor('login')).toBe(true);
    fill('email', 'player@example.com');
    fill('password', 'Password1!');
    signInWithEmail.mockResolvedValue({ email: 'player@example.com', displayName: 'Player' });
    (document.querySelector('.auth__form') as HTMLFormElement).requestSubmit();
    await new Promise<void>(queueMicrotask);
    expect(signInWithEmail).toHaveBeenCalledWith('player@example.com', 'Password1!');
    expect(createAppSession).toHaveBeenCalled();
    expect(modal.classList.contains('is-open')).toBe(false);
  });

  it('switches to registration, submits registration data and reports provider failure', async () => {
    const modal = createAuthModal();
    document.body.append(modal);
    const controller = initializeAuthModal(modal);
    controller.open('register');
    fill('username', 'Player1');
    fill('email', 'player@example.com');
    fill('password', 'Password1!');
    fill('confirm-password', 'Password1!');
    registerWithEmail.mockResolvedValue({ email: 'player@example.com', displayName: 'Player1' });
    (document.querySelector('.auth__form') as HTMLFormElement).requestSubmit();
    await new Promise<void>(queueMicrotask);
    expect(registerWithEmail).toHaveBeenCalledWith('player@example.com', 'Password1!', 'Player1');

    controller.open('login');
    signInWithGoogle.mockRejectedValue(new Error('Popup closed'));
    (document.querySelector('.auth__button-google') as HTMLButtonElement).click();
    await new Promise<void>(queueMicrotask);
    expect(showSnackbar).toHaveBeenCalledWith('Popup closed', 'error');
  });
});
