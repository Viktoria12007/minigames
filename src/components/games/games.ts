import allGamesSeed from '../../data/all-games-seed.json';
import { add, button, element } from '../../shared/dom';

type Game = (typeof allGamesSeed.data)[number];
type DetailsDialog = { open: (game: Game) => void };

const featuredGames = allGamesSeed.data.filter((game) => game.featured);
const autoplayDelay = 4000;

function formatLikes(likes: number): string {
  return `${(likes / 1000).toFixed(1)}K`;
}

function circularOffset(index: number, activeIndex: number): number {
  const difference = index - activeIndex;
  const half = Math.floor(featuredGames.length / 2);
  return difference > half
    ? difference - featuredGames.length
    : difference < -half
      ? difference + featuredGames.length
      : difference;
}

function visibleDistance(): number {
  return matchMedia('(max-width: 1024px)').matches ? 1 : 2;
}

export function createGamesSection(details: DetailsDialog): HTMLElement {
  const section = element('section', 'games container');
  section.setAttribute('aria-labelledby', 'games-title');
  const heading = element('div', 'games__heading');
  const controls = element('div', 'games__slider-controls');
  const previous = button('', 'games__button games__button_prev');
  const next = button('', 'games__button games__button_next');
  const title = element('h2', 'title', 'New Games');
  const track = element('div', 'games__track');
  let activeIndex = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let deadline = 0;
  let remaining = autoplayDelay;
  let pointerStart: { x: number; y: number } | undefined;
  let didSwipe = false;

  title.id = 'games-title';
  previous.type = 'button';
  next.type = 'button';
  previous.setAttribute('aria-label', 'Previous games');
  next.setAttribute('aria-label', 'Next games');
  track.setAttribute('aria-roledescription', 'carousel');
  track.setAttribute('aria-label', 'Featured games');

  const cards = featuredGames.map((game) => {
    const card = element('article', 'games__card');
    const image = element('img', 'games__image');
    const info = element('div', 'games__card-info');
    const name = element('div', 'games__name', game.name);
    const rating = element('div', 'games__rating', `${game.rating}`);
    const likes = element('div', 'games__likes', formatLikes(game.likesCount));
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open details for ${game.name}`);
    image.src = `${import.meta.env.BASE_URL}${game.cardImage.slice(1)}`;
    image.alt = game.name;
    card.addEventListener('click', () => {
      if (didSwipe) return;
      details.open(game);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      details.open(game);
    });
    add(info, name, rating, likes);
    add(card, image, info);
    return card;
  });

  const render = () => {
    const visible = visibleDistance();
    for (const [index, card] of cards.entries()) {
      const offset = circularOffset(index, activeIndex);
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
    clearTimer(false);
    deadline = performance.now() + delay;
    timer = setTimeout(() => {
      remaining = autoplayDelay;
      move(1, false);
      startTimer();
    }, delay);
  };
  const move = (direction: number, shouldResetTimer = true) => {
    activeIndex = (activeIndex + direction + featuredGames.length) % featuredGames.length;
    render();
    if (!shouldResetTimer) return;
    remaining = autoplayDelay;
    startTimer();
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('pointerdown', (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
    didSwipe = false;
    clearTimer(true);
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener('pointerup', (event) => {
    if (!pointerStart) return;
    const horizontalDistance = event.clientX - pointerStart.x;
    const verticalDistance = event.clientY - pointerStart.y;
    pointerStart = undefined;
    if (
      Math.abs(horizontalDistance) > 40 &&
      Math.abs(horizontalDistance) > Math.abs(verticalDistance)
    ) {
      didSwipe = true;
      move(horizontalDistance < 0 ? 1 : -1);
      setTimeout(() => {
        didSwipe = false;
      }, 0);
    } else {
      startTimer(remaining);
    }
  });
  track.addEventListener('pointercancel', () => {
    pointerStart = undefined;
    startTimer(remaining);
  });
  addEventListener('resize', render);
  add(controls, previous, next);
  add(heading, title, controls);
  track.append(...cards);
  add(section, heading, track);
  render();
  startTimer();
  return section;
}
