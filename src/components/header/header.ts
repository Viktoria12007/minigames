import { add, button, element, link } from '../../shared/dom';

export function createLogo(): HTMLAnchorElement {
  const node = link('', '#home', 'logo');
  node.setAttribute('aria-label', 'MiniGames home');
  add(node, element('div', 'logo__icon'), document.createTextNode('MiniGames'));
  return node;
}

export function createHeader(): HTMLElement {
  const root = element('header', 'header container');
  const nav = element('nav', 'header__nav');
  const list = element('ul', 'header__list');
  const actions = element('div', 'header__actions');
  nav.setAttribute('aria-label', 'Primary navigation');
  const headerLinks = [
    ['Home', '#home', location.hash === '#home' ? 'is-active' : ''],
    ['Library', '#library', location.hash === '#library' ? 'is-active' : ''],
    ['Tournaments', '#tournaments', location.hash === '#tournaments' ? 'is-active' : ''],
    ['Community', '#community', location.hash === '#community' ? 'is-active' : ''],
  ];
  for (const [text, href, className] of headerLinks) {
    const li = element('li', 'header__item');
    add(li, link(text, href, `header__link ${className}`));
    add(list, li);
  }
  add(nav, list);
  const login = button('Log In', 'header__button button button_ghost');
  const register = button('Sign Up', 'header__button button');
  login.dataset.auth = 'login';
  register.dataset.auth = 'register';
  add(actions, login, register);
  const burger = button('', 'burger');
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-expanded', 'true');
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
  close.addEventListener('click', () => {
    document.querySelector('.burger-menu_open')?.classList.remove('burger-menu_open');
  });
  add(headerBurger, createLogo(), close);
  const nav = element('nav', 'burger-menu__navigation');
  const list = element('ul', 'burger-menu__list');
  const actions = element('div', 'burger-menu__actions');
  nav.setAttribute('aria-label', 'Primary navigation');
  const headerLinks = [
    ['Home', '#home', location.hash === '#home' ? 'is-active' : ''],
    ['Library', '#library', location.hash === '#library' ? 'is-active' : ''],
    ['Tournaments', '#tournaments', location.hash === '#tournaments' ? 'is-active' : ''],
    ['Community', '#community', location.hash === '#community' ? 'is-active' : ''],
  ];
  for (const [text, href, className] of headerLinks) {
    const li = element('li', 'burger-menu__item');
    add(li, link(text, href, `burger-menu__link ${className}`));
    add(list, li);
  }
  add(nav, list);
  const login = button('Log In', 'burger-menu__button button button_ghost-white');
  const register = button('Sign Up', 'burger-menu__button button');
  login.dataset.auth = 'login';
  register.dataset.auth = 'register';
  login.addEventListener('click', () => {
    document.querySelector('.burger-menu_open')?.classList.remove('burger-menu_open');
  });
  register.addEventListener('click', () => {
    document.querySelector('.burger-menu_open')?.classList.remove('burger-menu_open');
  });
  add(actions, login, register);
  add(root, headerBurger, nav, actions);
  return root;
}
