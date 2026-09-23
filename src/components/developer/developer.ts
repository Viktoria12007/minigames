import { add, button, element } from '../../shared/dom';

export function createDeveloper(): HTMLElement {
  const section = element('section', 'developer container');
  const art = element('div', 'developer__image');
  const card = element('div', 'developer__card');
  section.setAttribute('aria-labelledby', 'developer-title');
  const title = element('h2', 'title developer__title', 'Are You a Game Developer?');
  title.id = 'developer-title';
  add(
    card,
    title,
    element(
      'p',
      'developer__text',
      `Want to see your game on MiniGames? We're always looking for fun, engaging mini games to add to our platform. Submit your game and reach thousands of players!`,
    ),
    button('Submit Form', 'button developer__button'),
    element('small', 'developer__contact', 'or contact us at developers@minigames.com'),
  );
  add(section, art, card);
  return section;
}
