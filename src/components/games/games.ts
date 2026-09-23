import allGamesSeed from '../../data/all-games-seed.json';
import { add, button, element } from '../../shared/dom';

export function createGamesSection(): HTMLElement {
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
    image.src = `${import.meta.env.BASE_URL}${game.cardImage.slice(1)}`;
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
