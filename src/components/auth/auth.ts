import { add, button, element, link } from '../../shared/dom';
import { registerWithEmail, signInWithEmail, signInWithGoogle } from '../../shared/firebase';
import { createAppSession } from '../../shared/session';
import { showSnackbar } from '../snackbar/snackbar';
import { validateAuthFields, type AuthFields, type AuthMode } from './validation';

export type { AuthMode } from './validation';

type AuthOptions = {
  onOpen?: (mode: AuthMode) => void;
  onClose?: () => void;
  onModeChange?: (mode: AuthMode) => void;
};

function field(
  labelText: string,
  type: string,
  name: string,
  placeholder: string,
  autocomplete: string,
) {
  const label = element('label', 'auth__label', labelText);
  const input = element('input', 'auth__input');
  input.type = type;
  input.name = name;
  input.setAttribute('autocomplete', autocomplete);
  input.placeholder = placeholder;
  input.required = true;
  if (type === 'password') input.minLength = 6;
  const error = element('span', 'auth__error');
  error.dataset.errorFor = name;
  error.setAttribute('aria-live', 'polite');
  label.append(input, error);
  return label;
}

function getInput(form: HTMLFormElement, name: string): string {
  const control = form.elements.namedItem(name);
  return control instanceof HTMLInputElement ? control.value : '';
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
  const close = button('×', 'auth__close');
  close.type = 'button';
  close.dataset.closeModal = '';
  close.setAttribute('aria-label', 'Close authentication dialog');
  const login = button('Login', 'auth__tabs-button is-active');
  const register = button('Register', 'auth__tabs-button');
  login.dataset.tab = 'login';
  register.dataset.tab = 'register';
  add(tabs, login, register);
  add(dialog, close, tabs, element('div', 'auth__content'));
  add(root, backdrop, dialog);
  return root;
}

export function initializeAuthModal(modal: HTMLDivElement, options: AuthOptions = {}) {
  const authContent = modal.querySelector<HTMLDivElement>('.auth__content');
  const tabButtons = modal.querySelectorAll<HTMLButtonElement>('[data-tab]');
  let currentMode: AuthMode | null = null;
  let isPending = false;

  function setPending(isRequestPending: boolean): void {
    isPending = isRequestPending;
    for (const control of modal.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
      'input, button',
    )) {
      control.disabled = isRequestPending;
    }
    modal.classList.toggle('is-pending', isRequestPending);
  }

  function closeModal(): void {
    if (isPending) return;
    const wasOpen = modal.classList.contains('is-open');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    currentMode = null;
    if (wasOpen) options.onClose?.();
  }

  function setAuthMode(mode: AuthMode): void {
    if (!authContent || isPending) return;
    const isLoginMode = mode === 'login';
    const title = element('h2', 'auth__title', isLoginMode ? 'Welcome Back!' : 'Create Account');
    title.id = 'dialog-title';
    const form = element('form', 'auth__form');
    if (!isLoginMode) {
      form.append(field('Username', 'text', 'username', 'e.g. CozyGamer99', 'username'));
    }
    add(
      form,
      field('Email Address', 'email', 'email', 'e.g. alex@minigames.com', 'email'),
      field(
        'Password',
        'password',
        'password',
        isLoginMode ? '••••••••' : 'Min. 6 characters',
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
    submit.disabled = true;
    form.append(submit);
    const google = button(
      isLoginMode ? 'Continue with Google' : 'Sign up with Google',
      'button auth__button-google',
    );
    google.type = 'button';
    google.prepend(element('div', 'auth__google-icon'));
    const switchText = element('p', 'auth__switch');
    const switchButton = button(isLoginMode ? 'Register' : 'Login', 'auth__switch-button');
    switchButton.type = 'button';
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

    const inputs = [...form.querySelectorAll<HTMLInputElement>('input')];
    const errors = [...form.querySelectorAll<HTMLElement>('[data-error-for]')];
    const values = (): AuthFields => ({
      email: getInput(form, 'email'),
      password: getInput(form, 'password'),
      username: isLoginMode ? undefined : getInput(form, 'username'),
      confirmPassword: isLoginMode ? undefined : getInput(form, 'confirm-password'),
    });
    const renderValidation = (): void => {
      const validationErrors = validateAuthFields(mode, values());
      for (const input of inputs) {
        const error = errors.find((item) => item.dataset.errorFor === input.name);
        const message = validationErrors[input.name as keyof AuthFields] ?? '';
        input.setAttribute('aria-invalid', String(Boolean(message)));
        if (error) {
          error.textContent = message;
        }
      }
      submit.disabled = Object.keys(validationErrors).length > 0 || isPending;
    };
    for (const input of inputs) {
      input.addEventListener('input', renderValidation);
      input.addEventListener('change', renderValidation);
      input.addEventListener('blur', renderValidation);
    }
    switchButton.addEventListener('click', () => {
      const nextMode = isLoginMode ? 'register' : 'login';
      options.onModeChange?.(nextMode);
      setAuthMode(nextMode);
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      renderValidation();
      if (isPending || submit.disabled) return;
      setPending(true);
      try {
        const formValues = values();
        const user = isLoginMode
          ? await signInWithEmail(formValues.email, formValues.password)
          : await registerWithEmail(
              formValues.email,
              formValues.password,
              formValues.username ?? '',
            );
        createAppSession(user);
        showSnackbar(`Welcome${user.displayName ? `, ${user.displayName}` : ''}!`, 'success');
        setPending(false);
        closeModal();
      } catch (error) {
        showSnackbar(
          error instanceof Error ? error.message : 'Authentication failed. Please try again.',
          'error',
        );
      } finally {
        setPending(false);
        renderValidation();
      }
    });
    google.addEventListener('click', async () => {
      if (isPending) return;
      setPending(true);
      try {
        const user = await signInWithGoogle();
        createAppSession(user);
        showSnackbar(`Welcome${user.displayName ? `, ${user.displayName}` : ''}!`, 'success');
        setPending(false);
        closeModal();
      } catch (error) {
        showSnackbar(
          error instanceof Error ? error.message : 'Google sign-in was not completed.',
          'error',
        );
      } finally {
        setPending(false);
        renderValidation();
      }
    });
    renderValidation();
  }

  function openModal(mode: AuthMode): void {
    setAuthMode(mode);
    currentMode = mode;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  for (const item of document.querySelectorAll<HTMLButtonElement>('[data-auth]')) {
    item.addEventListener('click', () => {
      const mode = item.dataset.auth === 'register' ? 'register' : 'login';
      options.onOpen?.(mode);
      if (!options.onOpen) {
          openModal(mode);
      }
    });
  }
  for (const item of tabButtons) {
    item.addEventListener('click', () => {
      const mode = item.dataset.tab === 'register' ? 'register' : 'login';
      options.onModeChange?.(mode);
      setAuthMode(mode);
    });
  }
  for (const item of modal.querySelectorAll<HTMLElement>('[data-close-modal]')) {
    item.addEventListener('click', closeModal);
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.isConnected && modal.classList.contains('is-open'))
      closeModal();
  });
  return {
    open: openModal,
    close: closeModal,
    isOpenFor: (mode: AuthMode) => modal.classList.contains('is-open') && currentMode === mode,
  };
}
