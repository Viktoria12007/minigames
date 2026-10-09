import { add, button, element, link } from '../../shared/dom';
import { checkAppSession, clearAppSession } from '../../shared/session';
import { showSnackbar } from '../snackbar/snackbar';

export function createLogo(): HTMLAnchorElement {
  const node = link('', `${import.meta.env.BASE_URL}`, 'logo');
  node.setAttribute('aria-label', 'MiniGames home');
  add(node, element('div', 'logo__icon'), document.createTextNode('MiniGames'));
  return node;
}

function getLinks() {
  return [
    ['Home', `${import.meta.env.BASE_URL}`],
    ['Library', `${import.meta.env.BASE_URL}library`],
    ['Tournaments', `${import.meta.env.BASE_URL}tournaments`],
    ['Community', `${import.meta.env.BASE_URL}community`],
  ].map(([text, href]) => [text, href, location.pathname === href ? 'is-active' : ''] as const);
}

function profileName(displayName: string, email: string): string {
  const name = displayName.trim();
  if (name) {
      return name;
  }
  const localPart = email.split('@', 1)[0]?.trim();
  return localPart || 'Player';
}

function initials(name: string): string | null {
  const words = name.trim().split(/\s+/u).filter(Boolean);
  const characters = words
    .slice(0, 2)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase())
    .filter((character): character is string => Boolean(character));
  return characters.length > 0 ? characters.join('') : null;
}

function createProfile(
  displayName: string,
  email: string,
  avatarUrl: string | undefined,
  profileClass: string,
): HTMLElement {
  const name = profileName(displayName, email);
  const profile = element('div', profileClass);
  const avatar = element('span', `${profileClass}-avatar`);
  avatar.setAttribute('aria-label', `${name}'s avatar`);
  const fallback = initials(name);
  const showFallback = () => {
    avatar.replaceChildren(
      fallback
        ? document.createTextNode(fallback)
        : element('span', `${profileClass}-avatar-generic`, '•'),
    );
    avatar.classList.add('is-fallback');
  };
  showFallback();
  if (avatarUrl) {
    const image = element('img', `${profileClass}-avatar-image`) as HTMLImageElement;
    image.src = avatarUrl;
    image.alt = '';
    image.addEventListener('load', () => {
      avatar.replaceChildren(image);
      avatar.classList.remove('is-fallback');
    });
    image.addEventListener('error', showFallback, { once: true });
  }
  add(profile, avatar, element('span', `${profileClass}-name`, name));
  return profile;
}

function populateAuthActions(
  actions: HTMLElement,
  buttonClass: string,
  profileClass: string,
): void {
  const session = checkAppSession().session;
  if (!session) {
    const login = button('Log In', `${buttonClass} button button_ghost`);
    const register = button('Sign Up', `${buttonClass} button`);
    login.dataset.auth = 'login';
    register.dataset.auth = 'register';
    actions.replaceChildren(login, register);
    return;
  }
  const profile = createProfile(
    session.displayName,
    session.email,
    session.avatarUrl,
    profileClass,
  );
  const logout = button('Log Out', `${buttonClass} button button_ghost`);
  logout.type = 'button';
  logout.addEventListener('click', () => {
    void clearAppSession().catch(() =>
      showSnackbar('You have been signed out, but Firebase could not confirm it.', 'error'),
    );
  });
  actions.replaceChildren(profile, logout);
}

export function createHeader(): HTMLElement {
  const root = element('header', 'header container');
  const nav = element('nav', 'header__nav');
  const list = element('ul', 'header__list');
  const actions = element('div', 'header__actions');
  nav.setAttribute('aria-label', 'Primary navigation');
  for (const [text, href, className] of getLinks()) {
    const li = element('li', 'header__item');
    add(li, link(text, href, `header__link ${className}`));
    list.append(li);
  }
  nav.append(list);
  const renderActions = () => populateAuthActions(actions, 'header__button', 'header__profile');
  renderActions();
  addEventListener('minigames:sessionchange', renderActions);
  const burger = button('', 'burger');
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.addEventListener('click', (event) => {
    const item = event.currentTarget as HTMLButtonElement;
    item.classList.toggle('is-open');
    item.setAttribute('aria-expanded', String(item.classList.contains('is-open')));
    document.querySelector('.burger-menu')?.classList.toggle('burger-menu_open');
  });
  add(burger, element('span'), element('span'), element('span'));
  add(root, createLogo(), nav, actions, burger);
  return root;
}

export function createBurgerMenu(): HTMLElement {
  const root = element('div', 'burger-menu');
  const headerBurger = element('div', 'burger-menu__header');
  const close = button('', 'close-burger');
  close.setAttribute('aria-label', 'Close menu');
  add(close, element('span'));
  close.addEventListener('click', () =>
    document.querySelector('.burger-menu_open')?.classList.remove('burger-menu_open'),
  );
  add(headerBurger, createLogo(), close);
  const nav = element('nav', 'burger-menu__navigation');
  const list = element('ul', 'burger-menu__list');
  const actions = element('div', 'burger-menu__actions');
  nav.setAttribute('aria-label', 'Primary navigation');
  for (const [text, href, className] of getLinks()) {
    const li = element('li', 'burger-menu__item');
    add(li, link(text, href, `burger-menu__link ${className}`));
    list.append(li);
  }
  nav.append(list);
  const renderActions = () =>
    populateAuthActions(actions, 'burger-menu__button', 'burger-menu__profile');
  renderActions();
  addEventListener('minigames:sessionchange', renderActions);
  actions.addEventListener('click', () =>
    document.querySelector('.burger-menu_open')?.classList.remove('burger-menu_open'),
  );
  add(root, headerBurger, nav, actions);
  return root;
}
