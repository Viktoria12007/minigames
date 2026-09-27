import { add, element, link } from '../../shared/dom';
import { createLogo } from '../header/header';

export function createFooter(): HTMLElement {
  const root = element('footer', 'footer');
  const wrap = element('div', 'footer__wrap container');
  const top = element('div', 'footer__top');
  const intro = element('div', 'footer__intro');
  const groups = element('div', 'footer__links');
  add(
    intro,
    createLogo(),
    element(
      'p',
      'footer__text',
      'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.',
    ),
  );
  const groupData: Array<[string, Array<[string, string, string]>]> = [
    [
      'Explore',
      [
        ['Home', '#home', location.hash === '#home' ? 'is-active' : ''],
        ['Library', '#library', location.hash === '#library' ? 'is-active' : ''],
        ['Categories', '#categories', location.hash === '#categories' ? 'is-active' : ''],
        ['Tournaments', '#tournaments', location.hash === '#tournaments' ? 'is-active' : ''],
      ],
    ],
    [
      'Company',
      [
        ['About Us', '#about', location.hash === '#about' ? 'is-active' : ''],
        ['Contact', '#contact', location.hash === '#contact' ? 'is-active' : ''],
        ['Privacy Policy', '#privacy', location.hash === '#privacy' ? 'is-active' : ''],
        ['Terms of Service', '#terms', location.hash === '#terms' ? 'is-active' : ''],
      ],
    ],
    [
      'Community',
      [
        ['Share', '#share', location.hash === '#share' ? 'is-active' : ''],
        ['Chat', '#chat', location.hash === '#chat' ? 'is-active' : ''],
        ['Feed', '#feed', location.hash === '#feed' ? 'is-active' : ''],
      ],
    ],
  ];
  for (const [name, items] of groupData) {
    const group = element('nav', 'footer__group');
    group.append(element('h3', 'footer__title', name));
    const list = element('ul', name === 'Community' ? 'footer__social-list' : 'footer__list');
    for (const [text, href, className] of items) {
      const li = element('li', name === 'Community' ? 'footer__social-item' : 'footer__item');
      if (name === 'Community') {
        const socialLink = link('', href, `footer__social-link ${className}`);
        socialLink.setAttribute('aria-label', text);
        li.append(socialLink);
      } else {
        li.append(link(text, href, `footer__link ${className}`));
      }
      add(list, li);
    }
    group.append(list);
    groups.append(group);
  }
  add(top, intro, groups);
  const bottom = element('div', 'footer__bottom');
  const textBottom = [
    'В© 2026 MiniGames. All rights reserved.',
    'RS School',
    '@student-nickname',
    'Designed with love',
  ];
  for (const text of textBottom) {
    if (text === 'RS School' || text === '@student-nickname') {
      const bottomLink = link('', 'https://app.rs.school/', 'footer__bottom-link');
      bottomLink.append(
        element(
          'div',
          `footer__bottom-icon footer__bottom-icon_${text.replace('@', '').split(' ', 1)[0]}`,
        ),
        element('span', '', text),
      );
      bottom.append(bottomLink);
    } else {
      bottom.append(element('span', '', text));
    }
  }
  add(wrap, top, bottom);
  add(root, wrap);
  return root;
}
