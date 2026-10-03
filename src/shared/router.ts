export type RoutePage = 'home' | 'library' | 'not-found';
export type AuthMode = 'login' | 'register';

export type RouteState = {
  page: RoutePage;
  category: string;
  sort: string;
  currentPage: number;
  game?: string;
  auth?: AuthMode;
};

export type RouteUpdate = Partial<
  Pick<RouteState, 'page' | 'category' | 'sort' | 'currentPage' | 'game' | 'auth'>
>;

const defaultState = {
  category: 'all',
  sort: 'rating-desc',
  currentPage: 1,
};
const validSorts = new Set(['rating-desc', 'rating-asc', 'name-asc', 'name-desc']);

export function readRoute(url = new URL(location.href)): RouteState {
  let page: RoutePage;
  if (
    url.pathname === `${import.meta.env.BASE_URL}` ||
    url.pathname === `${import.meta.env.BASE_URL}home`
  )
    page = 'home';
  else if (url.pathname === `${import.meta.env.BASE_URL}library`) page = 'library';
  else page = 'not-found';

  const requestedPage = Number(url.searchParams.get('page'));
  const auth = url.searchParams.get('auth');
  return {
    page,
    category: url.searchParams.get('category') || defaultState.category,
    sort: validSorts.has(url.searchParams.get('sort') ?? '')
      ? (url.searchParams.get('sort') as string)
      : defaultState.sort,
    currentPage: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    game: url.searchParams.get('game') || undefined,
    auth: auth === 'login' || auth === 'register' ? auth : undefined,
  };
}

export function routeUrl(update: RouteUpdate, current = readRoute()): string {
  const state = { ...current, ...update };
  const pathname =
    state.page === 'library'
      ? `${import.meta.env.BASE_URL}library`
      : state.page === 'home'
        ? `${import.meta.env.BASE_URL}`
        : location.pathname;
  const parameters = new URLSearchParams();
  if (state.page === 'library') {
    if (state.category !== defaultState.category) parameters.set('category', state.category);
    if (state.sort !== defaultState.sort) parameters.set('sort', state.sort);
    if (state.currentPage !== 1) parameters.set('page', String(state.currentPage));
  }
  if (state.game) parameters.set('game', state.game);
  if (state.auth) parameters.set('auth', state.auth);
  const query = parameters.toString();
  return `${pathname}${query ? `?${query}` : ''}`;
}

export function isAppUrl(anchor: HTMLAnchorElement): boolean {
  const url = new URL(anchor.href);
  return url.origin === location.origin && !anchor.target && !anchor.hasAttribute('download');
}
