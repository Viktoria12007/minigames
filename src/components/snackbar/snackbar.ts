import { button, element } from '../../shared/dom';

export type SnackbarVariant = 'success' | 'error';

const state: {
  snackbar?: HTMLElement;
  message?: HTMLElement;
  timeout?: ReturnType<typeof setTimeout>;
} = {};

function initialize(): void {
  if (state.snackbar && state.message) return;
  state.snackbar = element('div', 'snackbar');
  state.message = element('p', 'snackbar__message');
  const close = button('×', 'snackbar__close');
  state.snackbar.setAttribute('role', 'status');
  state.snackbar.setAttribute('aria-live', 'polite');
  state.snackbar.hidden = true;
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.addEventListener('click', hideSnackbar);
  state.snackbar.append(state.message, close);
  document.body.append(state.snackbar);
}

export function hideSnackbar(): void {
  if (state.timeout !== undefined) clearTimeout(state.timeout);
  state.timeout = undefined;
  if (state.snackbar) state.snackbar.hidden = true;
}

export function showSnackbar(text: string, variant: SnackbarVariant): void {
  initialize();
  if (!state.snackbar || !state.message) return;
  hideSnackbar();
  state.snackbar.dataset.variant = variant;
  state.message.textContent = text;
  state.snackbar.hidden = false;
  state.timeout = setTimeout(hideSnackbar, 5000);
}
