import { add, button, element } from '../../shared/dom.ts';
import games from '../../data/all-games-seed.json';

type Game = (typeof games.data)[number];
const libraryGames = [
  'vacation-cafe-simulator',
  'shelve-the-potions',
  'winter-burrow',
  'heartopia',
  'cat-mail-co',
  'palia',
]
  .map((slug) => games.data.find((game) => game.slug === slug))
  .filter((game): game is Game => game !== undefined);

function formatLikes(likes: number): string {
  return `${(likes / 1000).toFixed(1)}K`;
}

function createGameCard(game: Game, openDetails: (game: Game) => void): HTMLElement {
  const card = element('article', 'library-card');
  const image = element('img', 'library-card__image');
  const content = element('div', 'library-card__content');
  const heading = element('div', 'library-card__heading');
  const name = element('h2', 'library-card__name', game.name);
  const category = element('span', 'library-card__category', game.category);
  const price = element(
    'strong',
    `library-card__price ${game.price === 'Free' && 'library-card__price_free'}`,
    game.price,
  );
  const description = element('p', 'library-card__description', game.shortDescription);
  const meta = element('div', 'library-card__meta');
  const details = button('Details', 'library-card__details button');
  image.src = `${import.meta.env.BASE_URL}${game.cardImage.slice(1)}`;
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

export default function createCards(details: {
  root: HTMLElement;
  open: (game: Game) => void;
}): HTMLElement {
  const cards = element('div', 'library-list');

  const renderCards = () => {
    cards.replaceChildren(...libraryGames.map((game) => createGameCard(game, details.open)));
  };
  renderCards();
  return cards;
}
