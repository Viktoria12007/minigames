import './styles/main.scss';
import allGamesSeed from './data/all-games-seed.json';
import leaders from './data/leaderboard.json';

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
  const root = element('header', 'header container');
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

const main = element('main');
main.id = 'home';

function hero() {
  const hero = element('section', 'hero container');
  const art = element('div', 'hero__art');
  const card = element('div', 'hero__card');
  const heroTitle = element('h1', 'hero__title', 'Take a Short Break & Have Fun');
  hero.setAttribute('aria-labelledby', 'hero-title');
  art.setAttribute('aria-hidden', 'true');
  heroTitle.id = 'hero-title';
  add(
    card,
    heroTitle,
    element(
      'p',
      'hero__text',
      'Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.',
    ),
    link('Browse Library', '#library', 'hero__button button'),
  );
  add(hero, art, card);
  return hero;
}

function gamesSection(): HTMLElement {
  const section = element('section', 'games container');
  section.id = 'library';
  section.setAttribute('aria-labelledby', 'games-title');
  const heading = element('div', 'games__heading');
  const controls = element('div', 'games__slider-controls');
  const previous = button('', 'games__button games__button_prev');
  const next = button('', 'games__button games__button_next');
  previous.setAttribute('aria-label', 'Previous games');
  next.setAttribute('aria-label', 'Next games');
  add(controls, previous, next);
  const title = element('h2', 'title', 'New Games');
  title.id = 'games-title';
  add(heading, title, controls);
  const track = element('div', 'games__track');
  for (const game of allGamesSeed.data) {
    const card = element('article', 'games__card');
    const image = element('img', 'games__image');
    const info = element('div', 'games__card-info');
    image.src = game.cardImage;
    image.alt = game.name;
    add(
      info,
      element('div', 'games__name', game.name),
      element('div', 'games__rating', `${game.rating}`),
      element('div', 'games__likes', `${(game.likesCount / 1000).toFixed(1)}K`),
    );
    add(card, image, info);
    track.append(card);
  }
  add(section, heading, track);
  return section;
}

function leaderboard(): HTMLElement {
  const columns = ['Rank', 'Player', 'Games', 'Total', 'Streak', 'Favorite Game'];
  const section = element('section', 'leaderboard container');
  const title = element('h2', 'title');
  section.setAttribute('aria-labelledby', 'leaderboard-title');
  title.id = 'leaderboard-title';
  add(
    title,
    document.createTextNode('Top Players '),
    element('span', 'leaderboard__title_hide', 'This Week'),
  );
  const table = element('table', 'leaderboard__table');
  const thead = element('thead', 'leaderboard__thead');
  const headRow = element('tr');
  for (const [index, text] of columns.entries()) {
    const cell = element('th', index === 5 ? 'wide' : '');
    if (text === 'Games') {
      add(
        cell,
        document.createTextNode(text),
        element('span', 'leaderboard__col-title_hide', ' Played'),
      );
    } else if (text === 'Total') {
      add(
        cell,
        element('span', 'leaderboard__col-title_hide', 'Total'),
        document.createTextNode(' Score'),
      );
    } else {
      cell.textContent = text;
    }
    headRow.append(cell);
  }
  thead.append(headRow);
  const body = element('tbody', 'leaderboard__tbody');
  for (const [index, leader] of leaders.data.entries()) {
    const tr = element('tr');
    const player = element('td');
    const avatar = element(
      'div',
      `leaderboard__avatar leaderboard__avatar_${index + 1}`,
      leader.playerName.match(/[A-Z]/g)?.slice(0, 2).join(''),
    );
    const favorite = element('td', 'wide');
    add(player, avatar, document.createTextNode(leader.playerName));
    favorite.append(element('div', 'leaderboard__favorite-game', leader.favoriteGameName));
    const score = element('td', '', '');
    add(
      score,
      element(
        'span',
        'leaderboard__score_desktop',
        `${(leader.totalScore / 1000).toFixed(3).replace('.', ',')}`,
      ),
      element('span', 'leaderboard__score_mobile', `${(leader.totalScore / 1000).toFixed(1)}K`),
    );
    const streak = element('td', '', '');
    add(
      streak,
      element(
        'span',
        'leaderboard__streak_desktop',
        `🔥 ${leader.streakDays} ${leader.streakDays > 1 ? 'days' : 'day'}`,
      ),
      element('span', 'leaderboard__streak_mobile', `🔥 ${leader.streakDays}d`),
    );
    const row = [
      element('td', '', `# ${leader.rank}`),
      player,
      element('td', '', `${leader.gamesPlayed}`),
      score,
      streak,
      favorite,
    ];
    for (const cell of row) {
      tr.append(cell);
      body.append(tr);
    }
  }
  table.append(thead, body);
  const wrap = element('div', 'leaderboard__table-wrap');
  wrap.append(table);
  add(section, title, wrap);
  return section;
}

add(main, hero(), gamesSection(), leaderboard());
add(app, header(), burgerMenu(), main);
