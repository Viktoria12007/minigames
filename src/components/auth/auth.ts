import { add, button, element, link } from '../../shared/dom';

type AuthMode = 'login' | 'register';

function field(
  labelText: string,
  type: string,
  name: string,
  placeholder: string,
  autocomplete: string,
): HTMLLabelElement {
  const label = element('label', 'auth__label', labelText);
  const input = element('input', 'auth__input');
  input.type = type;
  input.name = name;
  input.setAttribute('autocomplete', autocomplete);
  input.placeholder = placeholder;
  input.required = true;
  if (type === 'password') {
    input.minLength = 8;
  }
  label.append(input);
  return label;
}

export function createAuthModal(): HTMLDivElement {
  const root = element('div', 'modal');
  const backdrop = element('div', 'modal__backdrop');
  const dialog = element('div', 'auth__dialog');
  const tabs = element('div', 'auth__tabs');
  root.setAttribute('aria-hidden', 'true');
  backdrop.dataset.closeModal = '';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  const login = button('Login', 'auth__tabs-button is-active');
  const register = button('Register', 'auth__tabs-button');
  login.dataset.tab = 'login';
  register.dataset.tab = 'register';
  add(tabs, login, register);
  add(dialog, tabs, element('div', 'auth__content'));
  add(root, backdrop, dialog);
  return root;
}

export function initializeAuthModal(modal: HTMLDivElement): void {
  const authContent = modal.querySelector<HTMLDivElement>('.auth__content');
  const tabButtons = modal.querySelectorAll<HTMLButtonElement>('[data-tab]');

  function setAuthMode(mode: AuthMode): void {
    if (!authContent) return;
    const isLoginMode = mode === 'login';
    const title = element('h2', 'auth__title', isLoginMode ? 'Welcome Back!' : 'Create Account');
    const form = element('form', 'auth__form');
    title.id = 'dialog-title';

    if (!isLoginMode) {
      form.append(field('Username', 'text', 'username', 'e.g. CozyGamer_99', 'username'));
    }

    add(
      form,
      field('Email Address', 'email', 'email', 'e.g. alex@minigames.com', 'email'),
      field(
        'Password',
        'password',
        'password',
        isLoginMode ? '••••••••' : 'Min. 8 characters',
        isLoginMode ? 'current-password' : 'new-password',
      ),
    );

    if (isLoginMode) {
      form.append(link('Forgot Password?', '#forgot', 'auth__forgot'));
    } else {
      form.append(
        field(
          'Confirm Password',
          'password',
          'confirm-password',
          'Repeat your password',
          'new-password',
        ),
      );
    }

    const submit = button(
      isLoginMode ? 'Login' : 'Create Account',
      'button button--full auth__button',
    );
    submit.type = 'submit';
    form.append(submit);
    const google = button(
      isLoginMode ? 'Continue with Google' : 'Sign up with Google',
      'button auth__button-google',
    );
    google.prepend(element('div', 'auth__google-icon'));
    const switchText = element('p', 'auth__switch');
    const switchButton = button(isLoginMode ? 'Register' : 'Login', 'auth__switch-button');
    switchButton.dataset.switch = '';
    add(
      switchText,
      document.createTextNode(
        isLoginMode ? "Don't have an account? " : 'Already have an account? ',
      ),
      switchButton,
    );
    authContent.replaceChildren(
      title,
      element(
        'p',
        'auth__content-lead',
        isLoginMode
          ? 'Sign in to resume your games and progress.'
          : 'Join MiniGames to track your score & streak.',
      ),
      form,
      element('div', 'auth__divider', 'OR'),
      google,
      switchText,
    );

    for (const item of tabButtons) {
      item.classList.toggle('is-active', item.dataset.tab === mode);
    }

    switchButton.addEventListener('click', () => setAuthMode(isLoginMode ? 'register' : 'login'));
    form.addEventListener('submit', (event) => event.preventDefault());
  }

  function openModal(mode: AuthMode): void {
    setAuthMode(mode);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeModal(): void {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  const dataAuthButtons = document.querySelectorAll<HTMLButtonElement>('[data-auth]');

  for (const item of dataAuthButtons) {
    item.addEventListener('click', () =>
      openModal(item.dataset.auth === 'register' ? 'register' : 'login'),
    );
  }

  for (const item of tabButtons) {
    item.addEventListener('click', () =>
      setAuthMode(item.dataset.tab === 'register' ? 'register' : 'login'),
    );
  }

  const dataCloseModals = modal.querySelectorAll<HTMLElement>('[data-close-modal]');

  for (const item of dataCloseModals) {
    item.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}
