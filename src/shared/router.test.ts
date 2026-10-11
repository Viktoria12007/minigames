import { isAppUrl, readRoute, routeUrl } from './router';

describe('router', () => {
  beforeEach(() => history.replaceState({}, '', '/minigames/'));

  it('parses valid library query state and falls back for invalid values', () => {
    expect(
      readRoute(
        new URL(
          'https://example.test/minigames/library?category=puzzle&sort=name-asc&page=2&game=cat&auth=login',
        ),
      ),
    ).toMatchObject({
      page: 'library',
      category: 'puzzle',
      sort: 'name-asc',
      currentPage: 2,
      game: 'cat',
      auth: 'login',
    });
    expect(
      readRoute(new URL('https://example.test/minigames/library?sort=nope&page=-1')),
    ).toMatchObject({
      sort: 'rating-desc',
      currentPage: 1,
    });
  });

  it('builds URLs without default query values', () => {
    expect(
      routeUrl({
        page: 'library',
        category: 'puzzle',
        sort: 'name-desc',
        currentPage: 3,
        auth: 'register',
      }),
    ).toBe('/minigames/library?category=puzzle&sort=name-desc&page=3&auth=register');
  });

  it('recognizes same-origin application links only', () => {
    const internal = document.createElement('a');
    internal.href = '/minigames/library';
    const external = document.createElement('a');
    external.href = 'https://other.test/page';
    expect(isAppUrl(internal)).toBe(true);
    expect(isAppUrl(external)).toBe(false);
  });
});
