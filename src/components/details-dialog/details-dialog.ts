import { add, button, element } from '../../shared/dom.ts';
import commentsData from '../../data/comments-tukoni-forest-keepers.json';
import gameData from '../../data/game-tukoni-forest-keepers.json';
import games from '../../data/all-games-seed.json';

type Game = (typeof games.data)[number];
type Comment = (typeof commentsData.data)[number];

function relativeTime(date: string): string {
  const days = Math.round((Date.parse('2026-09-02T10:00:00Z') - Date.parse(date)) / 86_400_000);
  return days === 0 ? '3 hours ago' : days === 1 ? '1 day ago' : `${days} days ago`;
}

function createComment(comment: Comment, index: number): HTMLElement {
  const item = element('li', 'game-dialog__comment');
  const header = element('div', 'game-dialog__comment-header');
  const avatar = element(
    'span',
    `game-dialog__avatar game-dialog__avatar_${index}`,
    comment.authorName.charAt(0),
  );
  const author = element('strong', 'game-dialog__comment-author', comment.authorName);
  const time = element('time', 'game-dialog__comment-time', relativeTime(comment.createdAt));
  const text = element('p', 'game-dialog__comment-text', comment.text);
  const like = button(`♡ ${comment.likesCount}`, 'game-dialog__like');
  let isLiked = false;

  time.dateTime = comment.createdAt;
  like.type = 'button';
  like.setAttribute('aria-label', 'Like comment');
  like.setAttribute('aria-pressed', 'false');
  like.addEventListener('click', () => {
    isLiked = !isLiked;
    like.classList.toggle('is-liked', isLiked);
    like.setAttribute('aria-label', isLiked ? 'Unlike comment' : 'Like comment');
    like.setAttribute('aria-pressed', String(isLiked));
  });

  add(header, avatar, author, time);
  add(item, header, text, like);
  return item;
}

export default function createDetailsDialog(): { root: HTMLElement; open: (game: Game) => void } {
  const root = element('div', 'game-dialog');
  const panel = element('section', 'game-dialog__panel');
  const hero = element('div', 'game-dialog__hero');
  const image = element('img', 'game-dialog__hero-image');
  const close = button('×', 'game-dialog__close');
  const content = element('div', 'game-dialog__content');
  const title = element('h2', 'game-dialog__title', gameData.data.name);
  const stats = element('div', 'game-dialog__stats');
  const rating = element('span', 'game-dialog__rating', `☆  ${gameData.data.rating}`);
  const likes = element(
    'span',
    'game-dialog__likes',
    `♡  ${(gameData.data.likesCount / 1000).toFixed(1)}K`,
  );
  const description = element('p', 'game-dialog__description', gameData.data.fullDescription);
  const badges = element('div', 'game-dialog__badges');
  const actions = element('div', 'game-dialog__actions');
  const play = button('Play Now', 'button game-dialog__play');
  const favorite = button('', 'game-dialog__favorite');
  const favoriteIcon = element('span', 'game-dialog__favorite-icon', '♡');
  const favoriteLabel = element('span', 'game-dialog__favorite-label', 'Add to Favorites');
  const recordsSection = element('section', 'game-dialog__records');
  const recordsTitle = element('h3', 'game-dialog__section-title', '🏆  Top Records');
  const records = element('ul', 'game-dialog__record-list');
  const commentsSection = element('section', 'game-dialog__comments');
  const commentsTitle = element('h3', 'game-dialog__section-title', 'Comments (3)');
  const form = element('form', 'game-dialog__form');
  const currentAvatar = element('span', 'game-dialog__avatar game-dialog__avatar_current', 'U');
  const textarea = element('textarea', 'game-dialog__textarea');
  const submit = button('▷', 'game-dialog__submit');
  const commentList = element('ul', 'game-dialog__comment-list');
  let opener: HTMLElement | null = null;
  let isFavorite = false;

  root.setAttribute('aria-hidden', 'true');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'game-dialog-title');
  title.id = 'game-dialog-title';
  image.src = `${import.meta.env.BASE_URL}${gameData.data.heroImage.slice(1)}`;
  image.alt = `${gameData.data.name} game cover`;
  close.type = 'button';
  close.setAttribute('aria-label', 'Close game details');
  favorite.type = 'button';
  favorite.setAttribute('aria-label', 'Add to Favorites');
  favorite.setAttribute('aria-pressed', 'false');
  play.type = 'button';
  textarea.name = 'comment';
  textarea.rows = 1;
  textarea.maxLength = 500;
  textarea.placeholder = 'Write a comment...';
  textarea.setAttribute('aria-label', 'Write a comment');
  submit.type = 'submit';
  submit.setAttribute('aria-label', 'Submit comment');

  const reset = () => {
    isFavorite = false;
    favorite.classList.remove('is-favorite');
    favoriteIcon.textContent = '♡';
    favoriteLabel.textContent = 'Add to Favorites';
    favorite.setAttribute('aria-label', 'Add to Favorites');
    favorite.setAttribute('aria-pressed', 'false');
    textarea.value = '';
    textarea.style.height = '';
    commentList.replaceChildren(
      ...commentsData.data.map((comment, index) => createComment(comment, index)),
    );
  };

  const hide = () => {
    if (!root.classList.contains('is-open')) return;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    opener?.focus();
  };

  close.addEventListener('click', hide);
  root.addEventListener('click', (event) => {
    if (event.target === root) hide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
  favorite.addEventListener('click', () => {
    isFavorite = !isFavorite;
    favorite.classList.toggle('is-favorite', isFavorite);
    favoriteIcon.textContent = isFavorite ? '♥' : '♡';
    favoriteLabel.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
    favorite.setAttribute('aria-label', isFavorite ? 'Remove from Favorites' : 'Add to Favorites');
    favorite.setAttribute('aria-pressed', String(isFavorite));
  });
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 88)}px`;
  });
  form.addEventListener('submit', (event) => event.preventDefault());

  for (const [label, value] of Object.entries(gameData.data.specs)) {
    const badge = element('div', 'game-dialog__badge');
    add(
      badge,
      element('span', 'game-dialog__badge-label', label),
      element('strong', 'game-dialog__badge-value', value),
    );
    badges.append(badge);
  }
  for (const [index, record] of gameData.data.topRecords.entries()) {
    const item = element('li', 'game-dialog__record');
    const medal = ['🥇', '🥈', '🥉'][index];
    const ago = ['2 days ago', '5 days ago', '1 week ago'][index];
    add(
      item,
      element('span', 'game-dialog__record-medal', medal),
      element('strong', 'game-dialog__record-player', record.playerName),
      element('strong', 'game-dialog__record-score', `${record.score.toLocaleString('en-US')} pts`),
      element('span', 'game-dialog__record-time', ago),
    );
    records.append(item);
  }

  add(stats, rating, likes);
  add(hero, image, close);
  add(favorite, favoriteIcon, favoriteLabel);
  add(actions, play, favorite);
  add(recordsSection, recordsTitle, records);
  add(form, currentAvatar, textarea, submit);
  add(commentsSection, commentsTitle, form, commentList);
  add(content, title, stats, description, badges, actions, recordsSection, commentsSection);
  add(panel, hero, content);
  root.append(panel);

  return {
    root,
    open: () => {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      reset();
      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      close.focus();
    },
  };
}
