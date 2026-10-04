import { add, button, element } from '../../shared/dom.ts';

export type LibraryGame = {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
};

function formatLikes(likes: number): string {
  return `${(likes / 1000).toFixed(1)}K`;
}

function imageSource(path: string): string {
  return /^(?:https?:)?\/\//.test(path)
    ? path
    : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

function createGameCard(game: LibraryGame, openDetails: (game: LibraryGame) => void): HTMLElement {
  const card = element('article', 'library-card');
  const image = element('img', 'library-card__image');
  const content = element('div', 'library-card__content');
  const heading = element('div', 'library-card__heading');
  const name = element('h2', 'library-card__name', game.name);
  const category = element('span', 'library-card__category', game.category);
  const priceClass =
    game.price === 'Free' ? 'library-card__price library-card__price_free' : 'library-card__price';
  const price = element('strong', priceClass, game.price);
  const description = element('p', 'library-card__description', game.shortDescription);
  const meta = element('div', 'library-card__meta');
  const details = button('Details', 'library-card__details button');
  image.src = imageSource(game.cardImage);
  image.alt = game.name;
  details.addEventListener('click', () => openDetails(game));
  add(heading, name, category, price);
  add(
    meta,
    element('span', 'library-card__rating', `${game.rating}`),
    element('span', 'library-card__likes', formatLikes(game.likesCount)),
  );
  add(content, heading, description, meta, details);
  add(card, image, content);
  return card;
}

function createState(kind: 'loading' | 'empty' | 'error', retry?: () => void): HTMLElement {
  const state = element('div', `library-list__state library-list__state_${kind}`);
  if (kind === 'loading') {
    state.setAttribute('role', 'status');
    state.setAttribute('aria-label', 'Loading games');
    for (let index = 0; index < 6; index += 1)
      state.append(element('div', 'library-list__skeleton'));
    return state;
  }
  state.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  add(
    state,
    element(
      'p',
      'library-list__state-title',
      kind === 'empty' ? 'Data Not Found' : 'Could not load games',
    ),
    element(
      'p',
      'library-list__state-text',
      kind === 'empty'
        ? 'Try another category or sort option.'
        : 'Please check your connection and try again.',
    ),
  );
  if (retry) {
    const retryButton = button('Try again', 'library-list__retry button');
    retryButton.type = 'button';
    retryButton.addEventListener('click', retry);
    state.append(retryButton);
  }
  return state;
}

export default function createCards(details: { open: (game: LibraryGame) => void }) {
  const cards = element('div', 'library-list');
  return {
    root: cards,
    loading() {
      cards.replaceChildren(createState('loading'));
    },
    empty() {
      cards.replaceChildren(createState('empty'));
    },
    error(retry: () => void) {
      cards.replaceChildren(createState('error', retry));
    },
    render(games: LibraryGame[]) {
      cards.replaceChildren(...games.map((game) => createGameCard(game, details.open)));
    },
  };
}
