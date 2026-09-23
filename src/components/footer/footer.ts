import { add, element, link } from '../../shared/dom';
import { createLogo } from '../header/header';

export function createFooter(): HTMLElement {
  const root = element('footer', 'footer');
  const wrap = element('div', 'footer__wrap container');
  const top = element('div', 'footer__top');
  const intro = element('div', 'footer__intro');
  const groups = element('div', 'footer__links');
  root.id = 'community';
  add(
    intro,
    createLogo(),
    element(
      'p',
      'footer__text',
      'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.',
    ),
  );
  const groupData: Array<[string, Array<[string, string]>]> = [
    [
      'Explore',
      [
        ['Home', '#home'],
        ['Library', '#library'],
        ['Categories', '#library'],
        ['Tournaments', '#tournaments'],
      ],
    ],
    [
      'Company',
      [
        ['About Us', '#about'],
        ['Contact', '#contact'],
        ['Privacy Policy', '#privacy'],
        ['Terms of Service', '#terms'],
      ],
    ],
    [
      'Community',
      [
        ['Share', '#share'],
        ['Chat', '#chat'],
        ['Feed', '#feed'],
      ],
    ],
  ];
  for (const [name, items] of groupData) {
    const group = element('nav', 'footer__group');
    group.append(element('h3', 'footer__title', name));
    const list = element('ul', name === 'Community' ? 'footer__social-list' : 'footer__list');
    for (const [text, href] of items) {
      const li = element('li', name === 'Community' ? 'footer__social-item' : 'footer__item');
      if (name === 'Community') {
        const socialLink = link('', href, 'footer__social-link');
        if (text === 'Share') {
          socialLink.innerHTML = `
                                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" fill="#2A264F"/>
                                    <path d="M23.5 28C22.8056 28 22.2153 27.7569 21.7292 27.2708C21.2431 26.7847 21 26.1944 21 25.5C21 25.375 21.0278 25.1736 21.0833 24.8958L16.1458 21.875C15.9236 22.0694 15.6736 22.2222 15.3958 22.3333C15.1181 22.4444 14.8194 22.5 14.5 22.5C13.8056 22.5 13.2153 22.2569 12.7292 21.7708C12.2431 21.2847 12 20.6944 12 20C12 19.3056 12.2431 18.7153 12.7292 18.2292C13.2153 17.7431 13.8056 17.5 14.5 17.5C14.8194 17.5 15.1181 17.5556 15.3958 17.6667C15.6736 17.7778 15.9236 17.9306 16.1458 18.125L21.0833 15.1042C21.0556 15.0069 21.0347 14.9097 21.0208 14.8125C21.0069 14.7153 21 14.6111 21 14.5C21 13.8056 21.2431 13.2153 21.7292 12.7292C22.2153 12.2431 22.8056 12 23.5 12C24.1944 12 24.7847 12.2431 25.2708 12.7292C25.7569 13.2153 26 13.8056 26 14.5C26 15.1944 25.7569 15.7847 25.2708 16.2708C24.7847 16.7569 24.1944 17 23.5 17C23.1806 17 22.8819 16.9444 22.6042 16.8333C22.3264 16.7222 22.0764 16.5694 21.8542 16.375L16.9167 19.3958C16.9444 19.4931 16.9653 19.5903 16.9792 19.6875C16.9931 19.7847 17 19.8889 17 20C17 20.1111 16.9931 20.2153 16.9792 20.3125C16.9653 20.4097 16.9444 20.5069 16.9167 20.6042L21.8542 23.625C22.0764 23.4306 22.3264 23.2778 22.6042 23.1667C22.8819 23.0556 23.1806 23 23.5 23C24.1944 23 24.7847 23.2431 25.2708 23.7292C25.7569 24.2153 26 24.8056 26 25.5C26 26.1944 25.7569 26.7847 25.2708 27.2708C24.7847 27.7569 24.1944 28 23.5 28ZM23.5 26.5C23.7778 26.5 24.0139 26.4028 24.2083 26.2083C24.4028 26.0139 24.5 25.7778 24.5 25.5C24.5 25.2222 24.4028 24.9861 24.2083 24.7917C24.0139 24.5972 23.7778 24.5 23.5 24.5C23.2222 24.5 22.9861 24.5972 22.7917 24.7917C22.5972 24.9861 22.5 25.2222 22.5 25.5C22.5 25.7778 22.5972 26.0139 22.7917 26.2083C22.9861 26.4028 23.2222 26.5 23.5 26.5ZM14.5 21C14.7778 21 15.0139 20.9028 15.2083 20.7083C15.4028 20.5139 15.5 20.2778 15.5 20C15.5 19.7222 15.4028 19.4861 15.2083 19.2917C15.0139 19.0972 14.7778 19 14.5 19C14.2222 19 13.9861 19.0972 13.7917 19.2917C13.5972 19.4861 13.5 19.7222 13.5 20C13.5 20.2778 13.5972 20.5139 13.7917 20.7083C13.9861 20.9028 14.2222 21 14.5 21ZM23.5 15.5C23.7778 15.5 24.0139 15.4028 24.2083 15.2083C24.4028 15.0139 24.5 14.7778 24.5 14.5C24.5 14.2222 24.4028 13.9861 24.2083 13.7917C24.0139 13.5972 23.7778 13.5 23.5 13.5C23.2222 13.5 22.9861 13.5972 22.7917 13.7917C22.5972 13.9861 22.5 14.2222 22.5 14.5C22.5 14.7778 22.5972 15.0139 22.7917 15.2083C22.9861 15.4028 23.2222 15.5 23.5 15.5Z" fill="white"/>
                                    </svg>
                            `;
        } else if (text === 'Chat') {
          socialLink.innerHTML = `
                                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" fill="#2A264F"/>
                                        <path d="M15 22H22V20.5H15V22ZM15 19.25H25V17.75H15V19.25ZM15 16.5H25V15H15V16.5ZM12 28V13.5C12 13.0833 12.1458 12.7292 12.4375 12.4375C12.7292 12.1458 13.0833 12 13.5 12H26.5C26.9167 12 27.2708 12.1458 27.5625 12.4375C27.8542 12.7292 28 13.0833 28 13.5V23.5C28 23.9167 27.8542 24.2708 27.5625 24.5625C27.2708 24.8542 26.9167 25 26.5 25H15L12 28ZM14.375 23.5H26.5V13.5H13.5V24.375L14.375 23.5ZM13.5 23.5V13.5V23.5Z" fill="white"/>
                                        </svg>

                            `;
        } else {
          socialLink.innerHTML = `
                                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" fill="#2A264F"/>
                                        <path d="M14.5 27C14.0833 27 13.7292 26.8542 13.4375 26.5625C13.1458 26.2708 13 25.9167 13 25.5C13 25.0833 13.1458 24.7292 13.4375 24.4375C13.7292 24.1458 14.0833 24 14.5 24C14.9167 24 15.2708 24.1458 15.5625 24.4375C15.8542 24.7292 16 25.0833 16 25.5C16 25.9167 15.8542 26.2708 15.5625 26.5625C15.2708 26.8542 14.9167 27 14.5 27ZM25 27C25 25.3333 24.6806 23.7778 24.0417 22.3333C23.4167 20.875 22.5625 19.6042 21.4792 18.5208C20.3958 17.4375 19.125 16.5833 17.6667 15.9583C16.2222 15.3194 14.6667 15 13 15V13C14.9444 13 16.7569 13.3681 18.4375 14.1042C20.1319 14.8264 21.6181 15.8264 22.8958 17.1042C24.1736 18.3819 25.1736 19.8681 25.8958 21.5625C26.6319 23.2431 27 25.0556 27 27H25ZM20 27C20 26.0278 19.8194 25.1181 19.4583 24.2708C19.0972 23.4236 18.5972 22.6806 17.9583 22.0417C17.3194 21.4028 16.5764 20.9028 15.7292 20.5417C14.8819 20.1806 13.9722 20 13 20V18C14.2639 18 15.4375 18.2361 16.5208 18.7083C17.6042 19.1667 18.5556 19.8056 19.375 20.625C20.1944 21.4444 20.8333 22.3958 21.2917 23.4792C21.7639 24.5625 22 25.7361 22 27H20Z" fill="white"/>
                                        </svg>

                    `;
        }

        socialLink.setAttribute('aria-label', text);
        li.append(socialLink);
      } else {
        li.append(link(text, href, 'footer__link'));
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
