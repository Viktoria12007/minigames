import { showSnackbar } from '../snackbar/snackbar';
import { getApiData } from '../../shared/api';
import { add, button, element } from '../../shared/dom';

export type FeaturedGame = {
  slug: string;
  name: string;
  cardImage: string;
  rating: number;
  likesCount: number;
};

type DetailsDialog = { open: (game: FeaturedGame) => void };

const autoplayDelay = 4000;

function visibleDistance(): number {
  return matchMedia('(max-width: 1024px)').matches ? 1 : 2;
}

function formatLikes(likes: number): string {
  return `${(likes / 1000).toFixed(1)}K`;
}

function imageSource(path: string): string {
  return /^(?:https?:)?\/\//.test(path)
    ? path
    : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

function createState(kind: 'loading' | 'empty' | 'error', retry?: () => void): HTMLElement {
  const state = element('div', `games__state games__state_${kind}`);
  if (kind === 'loading') {
    state.setAttribute('role', 'status');
    state.setAttribute('aria-label', 'Loading featured games');
    for (let index = 0; index < 3; index += 1) state.append(element('div', 'games__skeleton'));
    return state;
  }

  state.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  const title = kind === 'empty' ? 'No featured games yet' : 'Could not load featured games';
  const text =
    kind === 'empty'
      ? 'Check back soon for new games.'
      : 'Please check your connection and try again.';
  add(state, element('p', 'games__state-title', title), element('p', 'games__state-text', text));
  if (retry) {
    const retryButton = button('Try again', 'games__retry');
    retryButton.type = 'button';
    retryButton.addEventListener('click', retry);
    state.append(retryButton);
  }
  return state;
}

export function createGamesSection(details: DetailsDialog): HTMLElement {
  const section = element('section', 'games container');
  const heading = element('div', 'games__heading');
  const controls = element('div', 'games__slider-controls');
  const previous = button('', 'games__button games__button_prev');
  const next = button('', 'games__button games__button_next');
  const title = element('h2', 'title', 'New Games');
  const content = element('div', 'games__content');

  section.setAttribute('aria-labelledby', 'games-title');
  title.id = 'games-title';
  previous.type = 'button';
  next.type = 'button';
  previous.setAttribute('aria-label', 'Previous games');
  next.setAttribute('aria-label', 'Next games');
  controls.hidden = true;

  const renderCarousel = (games: FeaturedGame[]) => {
    const track = element('div', 'games__track');
    let activeIndex = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let deadline = 0;
    let remaining = autoplayDelay;
    let pointerStart: { x: number; y: number } | undefined;
    let didSwipe = false;
    const circularOffset = (index: number) => {
      const difference = index - activeIndex;
      const half = Math.floor(games.length / 2);
      if (difference > half) return difference - games.length;
      return difference < -half ? difference + games.length : difference;
    };
    const render = () => {
      const visible = visibleDistance();
      for (const [index, card] of cards.entries()) {
        const offset = circularOffset(index);
        const distance = Math.abs(offset);
        card.style.order = String(offset);
        card.dataset.size = distance === 0 ? 'large' : distance === 1 ? 'medium' : 'small';
        card.dataset.visible = String(distance <= visible);
        card.setAttribute('aria-hidden', String(distance > visible));
        card.tabIndex = distance <= visible ? 0 : -1;
      }
    };
    const clearTimer = (shouldKeepRemaining: boolean) => {
      if (timer === undefined) return;
      clearTimeout(timer);
      timer = undefined;
      if (shouldKeepRemaining) remaining = Math.max(0, deadline - performance.now());
    };
    const startTimer = (delay = remaining) => {
      if (games.length < 2) return;
      clearTimer(false);
      deadline = performance.now() + delay;
      timer = setTimeout(() => {
        remaining = autoplayDelay;
        move(1, false);
        startTimer();
      }, delay);
    };
    const move = (direction: number, shouldResetTimer = true) => {
      activeIndex = (activeIndex + direction + games.length) % games.length;
      render();
      if (!shouldResetTimer) return;
      remaining = autoplayDelay;
      startTimer();
    };
    const cards = games.map((game) => {
      const card = element('article', 'games__card');
      const image = element('img', 'games__image');
      const info = element('div', 'games__card-info');
      card.tabIndex = 0;
      card.setAttribute('aria-label', `Open details for ${game.name}`);
      image.src = imageSource(game.cardImage);
      image.alt = game.name;
      card.addEventListener('click', () => {
        if (!didSwipe) details.open(game);
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        details.open(game);
      });
      add(
        info,
        element('div', 'games__name', game.name),
        element('div', 'games__rating', `${game.rating}`),
        element('div', 'games__likes', formatLikes(game.likesCount)),
      );
      add(card, image, info);
      return card;
    });

    track.setAttribute('aria-roledescription', 'carousel');
    previous.disabled = games.length < 2;
    next.disabled = games.length < 2;
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('pointerdown', (event) => {
      pointerStart = { x: event.clientX, y: event.clientY };
      didSwipe = false;
      clearTimer(true);
    });
    track.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      const horizontal = event.clientX - pointerStart.x;
      const vertical = event.clientY - pointerStart.y;
      pointerStart = undefined;
      if (
        Math.abs(horizontal) > 40 &&
        Math.abs(horizontal) > Math.abs(vertical) &&
        games.length > 1
      ) {
        didSwipe = true;
        move(horizontal < 0 ? 1 : -1);
        setTimeout(() => (didSwipe = false), 0);
      } else {
        startTimer(remaining);
      }
    });
    track.addEventListener('pointercancel', () => {
      pointerStart = undefined;
      startTimer(remaining);
    });
    addEventListener('resize', render);
    track.append(...cards);
    render();
    startTimer();
    return track;
  };

  const load = async () => {
    controls.hidden = true;
    content.replaceChildren(createState('loading'));
    try {
      const games = await getApiData<FeaturedGame[]>('/games?featured=true');
      if (games.length === 0) {
        content.replaceChildren(createState('empty'));
        return;
      }
      content.replaceChildren(renderCarousel(games));
      controls.hidden = false;
    } catch {
      content.replaceChildren(createState('error', () => void load()));
      showSnackbar('Featured games could not be loaded. Please try again.', 'error');
    }
  };

  add(controls, previous, next);
  add(heading, title, controls);
  add(section, heading, content);
  void load();
  return section;
}
