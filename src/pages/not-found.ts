import { button, element } from '../shared/dom';

export default function createNotFoundPage(onHome: () => void): HTMLElement[] {
  const title = element('h1', 'not-found__title', '404 — Page not found');
  const text = element('p', 'not-found__text', 'The page you requested does not exist.');
  const home = button('Return to Home Page', 'button not-found__button');
  home.type = 'button';
  home.addEventListener('click', onHome);
  return [title, text, home];
}
