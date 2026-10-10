import { getApi, postApi } from '../../shared/api';
import { add, button, element } from '../../shared/dom';
import { checkAppSession, type AppSession } from '../../shared/session';
import type { FeaturedGame } from '../games/games';
import { showSnackbar } from '../snackbar/snackbar';

type Game = FeaturedGame;

type DetailsDialogOptions = {
  onOpen?: (slug: string) => void;
  onClose?: () => void;
  onRequireAuth?: () => void;
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
  isLikedByCurrentUser?: boolean;
};

type CommentsMeta = { totalComments?: number };
type FavoriteResponse = { isFavorited: boolean; likesCount: number };
type LikeResponse = { isLikedByCurrentUser: boolean; likesCount: number };

function imageSource(path: string): string {
  return /^(?:https?:)?\/\//.test(path)
    ? path
    : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

function formatLikes(likes: number): string {
  return likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : String(likes);
}

export function relativeTime(date: string, now = Date.now()): string {
  const minutes = Math.floor(Math.max(0, now - Date.parse(date)) / 60_000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
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
        ? subject === 'game'
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

function avatarInitial(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase() || '?';
}
function validAuthorName(session: AppSession): string {
  const candidate =
    session.displayName.trim() || session.email.split('@', 1)[0]?.trim() || 'Player';
  return candidate.length < 2 ? 'Player' : candidate.slice(0, 30);
}

export default function createDetailsDialog(options: DetailsDialogOptions = {}) {
  const root: HTMLElement = element('div', 'game-dialog');
  const panel = element('div', 'game-dialog__panel');
  const close = button('×', 'game-dialog__close');
  const dialogContent = element('div', 'game-dialog__content');
  let opener: HTMLElement | null = null;
  let requestId = 0;
  let openedSlug: string | null = null;
  const avatarColors = new Map<string, number>();

  const activeSession = (): AppSession | undefined => {
    const session = checkAppSession().session;
    if (session) {
      return session;
    }
    showSnackbar('Please sign in to use this feature.', 'error');
    options.onRequireAuth?.();
    return undefined;
  };
  const colorFor = (authorName: string): number => {
    const stored = avatarColors.get(authorName);
    if (stored !== undefined) {
      return stored;
    }
    const color = Math.floor(Math.random() * 5);
    avatarColors.set(authorName, color);
    return color;
  };
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
  root.setAttribute('aria-hidden', 'true');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'game-dialog-title');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close game details');

  const createComment = (comment: GameComment): HTMLElement => {
    const item = element('li', 'game-dialog__comment');
    const header = element('div', 'game-dialog__comment-header');
    const avatar = element(
      'span',
      `game-dialog__avatar game-dialog__avatar_${colorFor(comment.authorName)}`,
      avatarInitial(comment.authorName),
    );
    const author = element('strong', 'game-dialog__comment-author', comment.authorName);
    const time = element('time', 'game-dialog__comment-time', relativeTime(comment.createdAt));
    const text = element('p', 'game-dialog__comment-text', comment.text);
    const like = button(`♡ ${formatLikes(comment.likesCount)}`, 'game-dialog__like');
    time.dateTime = comment.createdAt;
    like.type = 'button';
    like.classList.toggle('is-liked', comment.isLikedByCurrentUser === true);
    like.setAttribute('aria-label', `${comment.likesCount} likes`);
    like.addEventListener('click', async () => {
      const session = activeSession();
      if (!session || like.disabled) return;
      like.disabled = true;
      like.classList.add('is-loading');
      like.setAttribute('aria-busy', 'true');
      try {
        const response = await postApi<LikeResponse>(
          `/comments/${encodeURIComponent(comment.commentId)}/like`,
          { userEmail: session.email },
        );
        comment.likesCount = response.data.likesCount;
        comment.isLikedByCurrentUser = response.data.isLikedByCurrentUser;
        like.textContent = `${comment.isLikedByCurrentUser ? '♥' : '♡'} ${formatLikes(comment.likesCount)}`;
        like.classList.toggle('is-liked', comment.isLikedByCurrentUser);
        like.setAttribute('aria-label', `${comment.likesCount} likes`);
      } catch {
        showSnackbar(
          'We could not confirm your like. Please check the current state before trying again.',
          'error',
        );
      } finally {
        like.disabled = false;
        like.classList.remove('is-loading');
        like.removeAttribute('aria-busy');
      }
    });
    add(header, avatar, author, time);
    add(item, header, text, like);
    return item;
  };

  const load = async (selectedGame: Game, currentRequest: number) => {
    avatarColors.clear();
    dialogContent.replaceChildren(createState('loading', 'game'));
    const currentSession = checkAppSession().session;
    const commentsSection = element('section', 'game-dialog__comments');
    const commentsTitle = element('h3', 'game-dialog__section-title', 'Comments');
    const commentsContent = element('div', 'game-dialog__comments-content');

    commentsContent.append(createState('loading', 'comments'));
    const refreshComments = async () => {
      const session = checkAppSession().session;
      const query = session ? `&userEmail=${encodeURIComponent(session.email)}` : '';
      try {
        const response = await getApi<GameComment[], CommentsMeta>(
          `/games/${encodeURIComponent(selectedGame.slug)}/comments?limit=3&sort=newest${query}`,
        );
        if (currentRequest !== requestId || !root.classList.contains('is-open')) return;
        commentsTitle.textContent = `Comments (${response.meta?.totalComments ?? response.data.length})`;
        commentsContent.replaceChildren(
          response.data.length > 0
            ? (() => {
                const list = element('ul', 'game-dialog__comment-list');
                list.append(...response.data.map((comment) => createComment(comment)));
                return list;
              })()
            : createState('empty', 'comments'),
        );
      } catch {
        if (currentRequest !== requestId || !root.classList.contains('is-open')) return;
        commentsContent.replaceChildren(
          createState('error', 'comments', () => void refreshComments()),
        );
        showSnackbar('Comments could not be loaded. Please try again.', 'error');
      }
    };
    const form = element('form', 'game-dialog__form');
    const formSession = checkAppSession().session;
    if (formSession) {
      const currentAvatar = element(
        'span',
        'game-dialog__avatar game-dialog__avatar_current',
        avatarInitial(validAuthorName(formSession)),
      );
      const textarea = element('textarea', 'game-dialog__textarea') as HTMLTextAreaElement;
      const submit = button('➤', 'game-dialog__submit');
      textarea.name = 'comment';
      textarea.placeholder = 'Write a comment…';
      textarea.maxLength = 500;
      textarea.rows = 1;
      submit.type = 'submit';
      submit.setAttribute('aria-label', 'Send comment');
      const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 88)}px`;
      };
      textarea.addEventListener('input', resize);
      form.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || event.shiftKey) return;
        event.preventDefault();
        form.requestSubmit();
      });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const session = activeSession();
        if (!session) return;
        const text = textarea.value.trim();
        if (!text) {
          showSnackbar('Write a comment before sending it.', 'error');
          return;
        }
        if (text.length > 500) {
          showSnackbar('A comment can contain up to 500 characters.', 'error');
          return;
        }
        if (submit.disabled) return;
        textarea.disabled = true;
        submit.disabled = true;
        submit.setAttribute('aria-busy', 'true');
        try {
          await postApi<GameComment>(`/games/${encodeURIComponent(selectedGame.slug)}/comments`, {
            userEmail: session.email,
            authorName: validAuthorName(session),
            text,
          });
          textarea.value = '';
          resize();
          showSnackbar('Comment posted.', 'success');
          await refreshComments();
        } catch {
          showSnackbar(
            'We could not confirm your comment. Your text was kept so you can check and retry.',
            'error',
          );
        } finally {
          textarea.disabled = false;
          submit.disabled = false;
          submit.removeAttribute('aria-busy');
        }
      });
      add(form, currentAvatar, textarea, submit);
    } else {
      const textarea = element('textarea', 'game-dialog__textarea game-dialog__textarea_wide') as HTMLTextAreaElement;
      textarea.placeholder = 'Sign in to write a comment';
      textarea.disabled = true;
      textarea.rows = 1;
      const signIn = button('➤', 'game-dialog__submit');
      signIn.type = 'button';
      signIn.setAttribute('aria-label', 'Sign in to comment');
      signIn.addEventListener('click', () => {
        showSnackbar('Please sign in to comment.', 'error');
        options.onRequireAuth?.();
      });
      add(form, textarea, signIn);
    }

      add(commentsSection, commentsTitle, form, commentsContent);

    const retry = () => void load(selectedGame, ++requestId);
    const gameRequest = getApi<GameDetails>(
      `/games/${encodeURIComponent(selectedGame.slug)}${currentSession ? `?userEmail=${encodeURIComponent(currentSession.email)}` : ''}`,
    );
    try {
      const response = await gameRequest;
      if (currentRequest !== requestId || !root.classList.contains('is-open')) return;
      if (!response.data) {
        dialogContent.replaceChildren(createState('empty', 'game'));
        return;
      }
      const game = response.data;
      const hero = element('div', 'game-dialog__hero');
      const image = element('img', 'game-dialog__hero-image');
      const wrap = element('div', 'game-dialog__wrap');
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
      favorite.classList.toggle('is-favorite', game.isLikedByCurrentUser === true);
      favorite.setAttribute('aria-label', favoriteLabel.textContent ?? 'Toggle favorite');
      favorite.addEventListener('click', async () => {
        const session = activeSession();
        if (!session || favorite.disabled) return;
        favorite.disabled = true;
        favorite.classList.add('is-loading');
        favorite.setAttribute('aria-busy', 'true');
        try {
          const result = await postApi<FavoriteResponse>(
            `/games/${encodeURIComponent(game.slug)}/favorite`,
            { userEmail: session.email },
          );
          game.isLikedByCurrentUser = result.data.isFavorited;
          game.likesCount = result.data.likesCount;
          favoriteIcon.textContent = game.isLikedByCurrentUser ? '♥' : '♡';
          favoriteLabel.textContent = game.isLikedByCurrentUser
            ? 'In Favorites'
            : 'Add to Favorites';
          likes.textContent = `♡ ${formatLikes(game.likesCount)}`;
          favorite.classList.toggle('is-favorite', game.isLikedByCurrentUser);
          favorite.setAttribute('aria-label', favoriteLabel.textContent);
        } catch {
          showSnackbar(
            'We could not confirm your favorite. Please check the current state before trying again.',
            'error',
          );
        } finally {
          favorite.disabled = false;
          favorite.classList.remove('is-loading');
          favorite.removeAttribute('aria-busy');
        }
      });
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
      add(wrap, title, stats, description, badges, actions, recordsSection, commentsSection);
      dialogContent.replaceChildren(hero, wrap);
    } catch {
      if (currentRequest !== requestId || !root.classList.contains('is-open')) return;
      dialogContent.replaceChildren(createState('error', 'game', retry));
      showSnackbar('Game details could not be loaded. Please try again.', 'error');
    }
    await refreshComments();
  };

  close.addEventListener('click', hide);
  root.addEventListener('click', (event) => {
    if (event.target === root) {
      hide();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.isConnected) {
      hide();
    }
  });
  addEventListener('minigames:sessionchange', () => {
    if (openedSlug && root.classList.contains('is-open')) {
      void load({ slug: openedSlug } as Game, ++requestId);
    }
  });
  add(panel, close, dialogContent);
  root.append(panel);
  return {
    root,
    open: (game: Game) => {
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
    openBySlug: (slug: string) => {
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
    isOpenFor: (slug: string) => root.classList.contains('is-open') && openedSlug === slug,
  };
}
