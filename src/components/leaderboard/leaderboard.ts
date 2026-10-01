import { showSnackbar } from '../snackbar/snackbar';
import { getApi } from '../../shared/api';
import { add, button, element } from '../../shared/dom';

type Leader = {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameName: string;
};

const columns = ['Rank', 'Player', 'Games', 'Total', 'Streak', 'Favorite Game'];

function createState(kind: 'loading' | 'empty' | 'error', retry?: () => void): HTMLElement {
  const state = element('div', `leaderboard__state leaderboard__state_${kind}`);
  if (kind === 'loading') {
    state.setAttribute('role', 'status');
    state.setAttribute('aria-label', 'Loading top players');
    for (let index = 0; index < 5; index += 1)
      state.append(element('div', 'leaderboard__skeleton'));
    return state;
  }

  state.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  const title = kind === 'empty' ? 'No top players yet' : 'Could not load top players';
  const text =
    kind === 'empty'
      ? 'Player scores will appear here soon.'
      : 'Please check your connection and try again.';
  add(
    state,
    element('p', 'leaderboard__state-title', title),
    element('p', 'leaderboard__state-text', text),
  );
  if (retry) {
    const retryButton = button('Try again', 'leaderboard__retry');
    retryButton.type = 'button';
    retryButton.addEventListener('click', retry);
    state.append(retryButton);
  }
  return state;
}

function createTable(leaders: Leader[]): HTMLElement {
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
  for (const [index, leader] of leaders.entries()) {
    const row = element('tr');
    const player = element('td');
    const initials =
      leader.playerName.match(/[A-Z]/g)?.slice(0, 2).join('') ?? leader.playerName.slice(0, 2);
    const avatar = element('div', `leaderboard__avatar leaderboard__avatar_${index + 1}`, initials);
    const score = element('td');
    const streak = element('td');
    add(player, avatar, document.createTextNode(leader.playerName));
    add(
      score,
      element(
        'span',
        'leaderboard__score_desktop',
        `${(leader.totalScore / 1000).toFixed(3).replace('.', ',')}`,
      ),
      element('span', 'leaderboard__score_mobile', `${(leader.totalScore / 1000).toFixed(1)}K`),
    );
    add(
      streak,
      element(
        'span',
        'leaderboard__streak_desktop',
        `🔥 ${leader.streakDays} ${leader.streakDays === 1 ? 'day' : 'days'}`,
      ),
      element('span', 'leaderboard__streak_mobile', `🔥 ${leader.streakDays}d`),
    );
    const cells = [
      element('td', '', `# ${leader.rank}`),
      player,
      element('td', '', `${leader.gamesPlayed}`),
      score,
      streak,
      element('td', 'wide'),
    ];
    cells[5].append(element('div', 'leaderboard__favorite-game', leader.favoriteGameName));
    row.append(...cells);
    body.append(row);
  }
  table.append(thead, body);
  const wrap = element('div', 'leaderboard__table-wrap');
  wrap.append(table);
  return wrap;
}

export function createLeaderboard(): HTMLElement {
  const section = element('section', 'leaderboard container');
  const title = element('h2', 'title');
  const content = element('div', 'leaderboard__content');
  section.setAttribute('aria-labelledby', 'leaderboard-title');
  title.id = 'leaderboard-title';
  add(
    title,
    document.createTextNode('Top Players '),
    element('span', 'leaderboard__title_hide', 'This Week'),
  );

  const load = async () => {
    content.replaceChildren(createState('loading'));
    try {
      const { data: leaders } = await getApi<Leader[]>('/leaderboard');
      content.replaceChildren(leaders.length === 0 ? createState('empty') : createTable(leaders));
    } catch {
      content.replaceChildren(createState('error', () => void load()));
      showSnackbar('Top players could not be loaded. Please try again.', 'error');
    }
  };

  add(section, title, content);
  void load();
  return section;
}
