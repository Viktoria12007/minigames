import { showSnackbar } from '../snackbar/snackbar';
import { getApi } from '../../shared/api';
import { add, button, element } from '../../shared/dom';
import type { FeaturedGame } from '../games/games';

type Game = FeaturedGame;

type DetailsDialogOptions = {
  onOpen?: (slug: string) => void;
  onClose?: () => void;
};

type GameDetails = {
  slug: string;
  name: string;
  heroImage: string;
  rating: number;
  likesCount: number;
  isLikedByCurrentUser?: boolean;
  fullDescription: string;
  specs: Record<string, string>;
  topRecords: Array<{
    position: number;
    playerName: string;
    score: number;
    achievedAt: string;
  }>;
};

type GameComment = {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  createdAt: string;
};

type CommentsMeta = { totalComments?: number };

function imageSource(path: string): string {
  return /^(?:https?:)?\/\//.test(path)
    ? path
    : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

function formatLikes(likes: number): string {
  return likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : String(likes);
}

export function relativeTime(date: string, now = Date.now()): string {
  const elapsed = Math.max(0, now - Date.parse(date));
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

function createState(
  kind: 'loading' | 'empty' | 'error',
  subject: 'game' | 'comments',
  retry?: () => void,
): HTMLElement {
  const state = element('div', `game-dialog__state game-dialog__state_${kind}`);
  if (kind === 'loading') {
    state.setAttribute('role', 'status');
    state.setAttribute('aria-label', `Loading ${subject}`);
    for (let index = 0; index < (subject === 'game' ? 5 : 3); index += 1) {
      state.append(element('div', 'game-dialog__skeleton'));
    }
    return state;
  }

  state.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  const isGame = subject === 'game';
  add(
    state,
    element(
      'p',
      'game-dialog__state-title',
      kind === 'empty' ? `No ${subject} found` : `Could not load ${subject}`,
    ),
    element(
      'p',
      'game-dialog__state-text',
      kind === 'empty'
        ? isGame
          ? 'This game is not available right now.'
          : 'Be the first to comment on this game.'
        : 'Please check your connection and try again.',
    ),
  );
  if (retry) {
    const retryButton = button('Try again', 'game-dialog__retry');
    retryButton.type = 'button';
    retryButton.addEventListener('click', retry);
    state.append(retryButton);
  }
  return state;
}

function createComment(comment: GameComment, index: number): HTMLElement {
  const item = element('li', 'game-dialog__comment');
  const header = element('div', 'game-dialog__comment-header');
  const avatar = element(
    'span',
    `game-dialog__avatar game-dialog__avatar_${index % 3}`,
    comment.authorName.charAt(0),
  );
  const author = element('strong', 'game-dialog__comment-author', comment.authorName);
  const time = element('time', 'game-dialog__comment-time', relativeTime(comment.createdAt));
  const text = element('p', 'game-dialog__comment-text', comment.text);
  const likes = element('span', 'game-dialog__like', `♡ ${formatLikes(comment.likesCount)}`);

  time.dateTime = comment.createdAt;
  likes.setAttribute('aria-label', `${comment.likesCount} likes`);
  add(header, avatar, author, time);
  add(item, header, text, likes);
  return item;
}

export default function createDetailsDialog(options: DetailsDialogOptions = {}): {
  root: HTMLElement;
  open: (game: Game) => void;
  openBySlug: (slug: string) => void;
  close: () => void;
  isOpenFor: (slug: string) => boolean;
} {
  const root = element('div', 'game-dialog');
  const panel = element('div', 'game-dialog__panel');
  const close = button('×', 'game-dialog__close');
  const dialogContent = element('div', 'game-dialog__content');
  let opener: HTMLElement | null = null;
  let requestId = 0;
  let openedSlug: string | null = null;

  root.setAttribute('aria-hidden', 'true');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'game-dialog-title');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close game details');

  const hide = () => {
    if (!root.classList.contains('is-open')) return;
    requestId += 1;
    openedSlug = null;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    opener?.focus();
    options.onClose?.();
  };

  const renderGame = (game: GameDetails, comments: HTMLElement) => {
    const hero = element('div', 'game-dialog__hero');
    const image = element('img', 'game-dialog__hero-image');
    const dialogWrap = element('div', 'game-dialog__wrap');
    const title = element('h2', 'game-dialog__title', game.name);
    const stats = element('div', 'game-dialog__stats');
    const rating = element('span', 'game-dialog__rating', `☆ ${game.rating}`);
    const likes = element('span', 'game-dialog__likes', `♡ ${formatLikes(game.likesCount)}`);
    const description = element('p', 'game-dialog__description', game.fullDescription);
    const badges = element('div', 'game-dialog__badges');
    const actions = element('div', 'game-dialog__actions');
    const play = button('Play Now', 'button game-dialog__play');
    const favorite = button('', 'game-dialog__favorite');
    const favoriteIcon = element(
      'span',
      'game-dialog__favorite-icon',
      game.isLikedByCurrentUser ? '♥' : '♡',
    );
    const favoriteLabel = element(
      'span',
      'game-dialog__favorite-label',
      game.isLikedByCurrentUser ? 'In Favorites' : 'Add to Favorites',
    );
    const recordsSection = element('section', 'game-dialog__records');
    const recordsTitle = element('h3', 'game-dialog__section-title', '🏆 Top Records');
    const records = element('ul', 'game-dialog__record-list');

    title.id = 'game-dialog-title';
    image.src = imageSource(game.heroImage);
    image.alt = `${game.name} game cover`;
    play.type = 'button';
    favorite.type = 'button';
    favorite.disabled = true;
    favorite.setAttribute('aria-label', 'Favorites are not available yet');
    favorite.title = 'Favorites are not available yet';
    favorite.classList.toggle('is-favorite', game.isLikedByCurrentUser === true);

    for (const [label, value] of Object.entries(game.specs)) {
      const badge = element('div', 'game-dialog__badge');
      add(
        badge,
        element('span', 'game-dialog__badge-label', label),
        element('strong', 'game-dialog__badge-value', value),
      );
      badges.append(badge);
    }
    for (const record of game.topRecords) {
      const item = element('li', 'game-dialog__record');
      const medal = ['🥇', '🥈', '🥉'][record.position - 1] ?? `#${record.position}`;
      const recordTime = element(
        'time',
        'game-dialog__record-time',
        relativeTime(record.achievedAt),
      );
      recordTime.dateTime = record.achievedAt;
      add(
        item,
        element('span', 'game-dialog__record-medal', medal),
        element('strong', 'game-dialog__record-player', record.playerName),
        element(
          'strong',
          'game-dialog__record-score',
          `${record.score.toLocaleString('en-US')} pts`,
        ),
        recordTime,
      );
      records.append(item);
    }

    add(hero, image);
    add(stats, rating, likes);
    add(favorite, favoriteIcon, favoriteLabel);
    add(actions, play, favorite);
    add(recordsSection, recordsTitle, records);
    add(dialogWrap, title, stats, description, badges, actions, recordsSection, comments);
    dialogContent.replaceChildren(hero, dialogWrap);
  };

  const load = async (selectedGame: Game, currentRequest: number) => {
    dialogContent.replaceChildren(createState('loading', 'game'));
    const commentsSection = element('section', 'game-dialog__comments');
    const commentsTitle = element('h3', 'game-dialog__section-title', 'Comments');
    const commentsContent = element('div', 'game-dialog__comments-content');
    add(commentsSection, commentsTitle, commentsContent);
    commentsContent.append(createState('loading', 'comments'));

    const retry = () => void load(selectedGame, ++requestId);
    const gameRequest = getApi<GameDetails>(`/games/${encodeURIComponent(selectedGame.slug)}`);
    const commentsRequest = getApi<GameComment[], CommentsMeta>(
      `/games/${encodeURIComponent(selectedGame.slug)}/comments?limit=3&sort=newest`,
    );

    try {
      const response = await gameRequest;
      if (currentRequest !== requestId || !root.classList.contains('is-open')) return;
      if (!response.data) {
        dialogContent.replaceChildren(createState('empty', 'game'));
        return;
      }
      renderGame(response.data, commentsSection);
    } catch {
      if (currentRequest !== requestId || !root.classList.contains('is-open')) return;
      dialogContent.replaceChildren(createState('error', 'game', retry));
      showSnackbar('Game details could not be loaded. Please try again.', 'error');
    }

    try {
      const response = await commentsRequest;
      if (currentRequest !== requestId || !root.classList.contains('is-open')) return;
      const total = response.meta?.totalComments ?? response.data.length;
      commentsTitle.textContent = `Comments (${total})`;
      if (response.data.length === 0) {
        commentsContent.replaceChildren(createState('empty', 'comments'));
        return;
      }
      const list = element('ul', 'game-dialog__comment-list');
      list.append(...response.data.map((comment, index) => createComment(comment, index)));
      commentsContent.replaceChildren(list);
    } catch {
      if (currentRequest !== requestId || !root.classList.contains('is-open')) return;
      commentsContent.replaceChildren(createState('error', 'comments', retry));
      showSnackbar('Comments could not be loaded. Please try again.', 'error');
    }
  };

  close.addEventListener('click', hide);
  root.addEventListener('click', (event) => {
    if (event.target === root) hide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.isConnected) hide();
  });

  add(panel, close, dialogContent);
  root.append(panel);

  return {
    root,
    open: (game) => {
      options.onOpen?.(game.slug);
      if (options.onOpen) return;
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      openedSlug = game.slug;
      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      close.focus();
      void load(game, ++requestId);
    },
    openBySlug: (slug) => {
      if (openedSlug === slug && root.classList.contains('is-open')) return;
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      openedSlug = slug;
      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      close.focus();
      void load({ slug } as Game, ++requestId);
    },
    close: hide,
    isOpenFor: (slug) => root.classList.contains('is-open') && openedSlug === slug,
  };
}
