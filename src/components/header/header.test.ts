import { jest } from '@jest/globals';

const checkAppSession =
  jest.fn<
    () => { status?: string; session?: { displayName: string; email: string; avatarUrl?: string } }
  >();
const clearAppSession = jest.fn<() => Promise<void>>();
const showSnackbar = jest.fn<(text: string, variant: 'success' | 'error') => void>();
jest.unstable_mockModule('../../shared/session', () => ({ checkAppSession, clearAppSession }));
jest.unstable_mockModule('../snackbar/snackbar', () => ({ showSnackbar }));
const { createHeader, createBurgerMenu } = await import('./header');

describe('header actions', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    jest.clearAllMocks();
  });

  it('renders guest controls and toggles the burger menu', () => {
    checkAppSession.mockReturnValue({ status: 'guest' });
    const menu = createBurgerMenu();
    const header = createHeader();
    document.body.append(menu, header);
    expect(header.textContent).toContain('Log In');
    (header.querySelector('.burger') as HTMLButtonElement).click();
    expect(menu.classList.contains('burger-menu_open')).toBe(true);
  });

  it('renders profile and clears session on logout', async () => {
    checkAppSession.mockReturnValue({
      session: { displayName: 'Ada Lovelace', email: 'ada@example.com' },
    });
    clearAppSession.mockResolvedValue();
    const header = createHeader();
    document.body.append(header);
    expect(header.textContent).toContain('Ada Lovelace');
    (header.querySelector('[data-logout]') as HTMLButtonElement).click();
    await new Promise<void>(queueMicrotask);
    expect(clearAppSession).toHaveBeenCalled();
  });
});
