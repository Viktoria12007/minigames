import { button, element } from '../../shared/dom';

export type SnackbarVariant = 'success' | 'error';

interface State {
  snackbar?: HTMLElement;
  message?: HTMLElement;
  timeout?: ReturnType<typeof setTimeout>;
}

function initialize(): State {
  const state: State = {
    snackbar: element('div', 'snackbar'),
    message: element('p', 'snackbar__message'),
  };
  if (!state.snackbar || !state.message) return state;
  const close = button('×', 'snackbar__close');
  state.snackbar.setAttribute('role', 'status');
  state.snackbar.setAttribute('aria-live', 'polite');
  state.snackbar.hidden = true;
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.addEventListener('click', () => hideSnackbar(state));
  state.snackbar.append(state.message, close);
  return state;
}

export function hideSnackbar(state: State): void {
  if (state.timeout !== undefined) clearTimeout(state.timeout);
  state.timeout = undefined;
  if (!state.snackbar) {
    return;
  }

  state.snackbar.hidden = true;
  state.snackbar.remove();
}

export function showSnackbar(text: string, variant: SnackbarVariant): void {
  let container = document.querySelector('.snackbar-list');
  const state = initialize();
  if (!state.snackbar || !state.message) return;
  if (!container) {
    container = element('div', 'snackbar-list');
    document.body.append(container);
  }
  container.append(state.snackbar);
  state.snackbar.dataset.variant = variant;
  state.message.textContent = text;
  state.snackbar.hidden = false;
  state.timeout = setTimeout(() => hideSnackbar(state), 5000);
}
