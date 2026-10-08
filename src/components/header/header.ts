import { add, button, element, link } from '../../shared/dom';
import { checkAppSession, clearAppSession } from '../../shared/session';

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
  const profile = element('span', profileClass, session.displayName);
  const logout = button('Log Out', `${buttonClass} button button_ghost`);
  logout.type = 'button';
  logout.addEventListener('click', clearAppSession);
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
