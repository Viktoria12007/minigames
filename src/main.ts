import './styles/main.scss';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('Application root is missing');

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function add(parent: Element, ...children: Array<Node | null | undefined>): void {
  parent.append(
    ...children.filter((child): child is Node => child !== null && child !== undefined),
  );
}

function link(text: string, href: string, className?: string): HTMLAnchorElement {
  const node = element('a', className, text);
  node.href = href;
  return node;
}

function button(text: string, className?: string): HTMLButtonElement {
  return element('button', className, text);
}

function logo(): HTMLAnchorElement {
  const node = link('', '#home', 'logo');
  node.setAttribute('aria-label', 'MiniGames home');
  add(node, element('div', 'logo__icon'), document.createTextNode('MiniGames'));
  return node;
}

function header(): HTMLElement {
  const root = element('header', 'header');
  const nav = element('nav', 'navigation');
  const actions = element('div', 'header__actions');
  nav.setAttribute('aria-label', 'Primary navigation');
  add(
    nav,
    link('Home', '#home', 'is-active'),
    link('Library', '#library'),
    link('Tournaments', '#tournaments'),
    link('Community', '#community'),
  );
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
  add(root, logo(), nav, actions, burger);
  return root;
}

function burgerMenu(): HTMLElement {
  const root = element('div', 'burger-menu');
  const headerBurger = element('div', 'burger-menu__header');
  const close = button('', 'close-burger');
  close.setAttribute('aria-label', 'Close menu');
  add(close, element('span'));
  close.addEventListener('click', () => {
    document.querySelector('.burger-menu_open')?.classList.remove('burger-menu_open');
  });
  add(headerBurger, logo(), close);
  const nav = element('nav', 'burger-menu__navigation');
  const actions = element('div', 'burger-menu__actions');
  nav.setAttribute('aria-label', 'Primary navigation');
  add(
    nav,
    link('Home', '#home', 'is-active'),
    link('Library', '#library'),
    link('Tournaments', '#tournaments'),
    link('Community', '#community'),
  );
  const login = button('Log In', 'burger-menu__button button button_ghost-white');
  const register = button('Sign Up', 'burger-menu__button button');
  login.dataset.auth = 'login';
  register.dataset.auth = 'register';
  add(actions, login, register);
  add(root, headerBurger, nav, actions);
  return root;
}

add(app, header(), burgerMenu());
