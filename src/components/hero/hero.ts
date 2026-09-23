import { add, element, link } from '../../shared/dom';

export function createHero() {
  const hero = element('section', 'hero container');
  const art = element('div', 'hero__art');
  const card = element('div', 'hero__card');
  const heroTitle = element('h1', 'hero__title', 'Take a Short Break & Have Fun');
  hero.setAttribute('aria-labelledby', 'hero-title');
  art.setAttribute('aria-hidden', 'true');
  heroTitle.id = 'hero-title';
  add(
    card,
    heroTitle,
    element(
      'p',
      'hero__text',
      'Discover hundreds of curated casual mini-games. Play instantly in your browser вЂ” puzzle, match 3, farm, and board classics.',
    ),
    link('Browse Library', '#library', 'hero__button button'),
  );
  add(hero, art, card);
  return hero;
}



