import { hideSnackbar, showSnackbar } from './snackbar';

describe('snackbar', () => {
  beforeEach(() => document.body.replaceChildren());

  it('shows a notification and dismisses it manually', () => {
    showSnackbar('Saved', 'success');
    expect(document.querySelector('.snackbar__message')?.textContent).toBe('Saved');
    expect(document.querySelector<HTMLElement>('.snackbar')?.dataset.variant).toBe('success');
    (document.querySelector('.snackbar__close') as HTMLButtonElement).click();
    expect(document.querySelector('.snackbar')).toBeNull();
  });

  it('safely hides incomplete state', () => {
    expect(() => hideSnackbar({})).not.toThrow();
  });
});
