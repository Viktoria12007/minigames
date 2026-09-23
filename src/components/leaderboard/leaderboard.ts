import leaders from '../../data/leaderboard.json';
import { add, element } from '../../shared/dom';

export function createLeaderboard(): HTMLElement {
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
        `рџ”Ґ ${leader.streakDays} ${leader.streakDays > 1 ? 'days' : 'day'}`,
      ),
      element('span', 'leaderboard__streak_mobile', `рџ”Ґ ${leader.streakDays}d`),
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



