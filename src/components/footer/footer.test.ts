import { jest } from '@jest/globals';

jest.unstable_mockModule('../header/header', () => ({
  createLogo: () => {
    const logo = document.createElement('a');
    logo.className = 'logo';
    return logo;
  },
}));
const { createFooter } = await import('./footer');

describe('footer', () => {
  it('renders navigation groups, social links and attribution links', () => {
    history.replaceState({}, '', '/minigames/library');
    const footer = createFooter();
    expect(footer.querySelectorAll('.footer__group')).toHaveLength(3);
    expect(footer.querySelector('.footer__link.is-active')?.textContent).toBe('Library');
    expect(footer.querySelectorAll('.footer__social-link')).toHaveLength(3);
    expect(footer.textContent).toContain('RS School');
  });
});
