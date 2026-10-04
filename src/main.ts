import './styles/main.scss';
import { createAuthModal, initializeAuthModal } from './components/auth/auth';
import createDetailsDialog from './components/details-dialog/details-dialog';
import { createFooter } from './components/footer/footer';
import { createBurgerMenu, createHeader } from './components/header/header';
import type { FeaturedGame } from './components/games/games';
import createHomePage from './pages/home';
import createLibraryPage from './pages/library';
import createNotFoundPage from './pages/not-found';
import { element } from './shared/dom';
import {
  isAppUrl,
  readRoute,
  routeUrl,
  type AuthMode,
  type RouteState,
  type RouteUpdate,
} from './shared/router';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root is missing');
const appElement = app;

type Game = FeaturedGame;
type DetailsModal = {
  root: HTMLElement;
  open: (game: Game) => void;
  openBySlug: (slug: string) => void;
  close: () => void;
  isOpenFor: (slug: string) => boolean;
};
type AuthModal = {
  open: (mode: AuthMode) => void;
  close: () => void;
  isOpenFor: (mode: AuthMode) => boolean;
};

const modals: { details: DetailsModal | null; auth: AuthModal | null } = {
  details: null,
  auth: null,
};
const routerState: {
  renderedRoute: RouteState | null;
  isSyncingModals: boolean;
} = { renderedRoute: null, isSyncingModals: false };

function shouldRenderPage(route: RouteState): boolean {
  return !routerState.renderedRoute || routerState.renderedRoute.page !== route.page
    ? true
    : route.page === 'library' &&
        (routerState.renderedRoute.category !== route.category ||
          routerState.renderedRoute.sort !== route.sort ||
          routerState.renderedRoute.currentPage !== route.currentPage);
}

function syncModals(route: RouteState): void {
  if (!modals.details || !modals.auth) return;
  routerState.isSyncingModals = true;
  try {
    if (route.game) {
      modals.auth.close();
      if (!modals.details.isOpenFor(route.game)) modals.details.openBySlug(route.game);
      return;
    }

    modals.details.close();
    if (route.auth) {
      if (!modals.auth.isOpenFor(route.auth)) modals.auth.open(route.auth);
    } else {
      modals.auth.close();
    }
  } finally {
    routerState.isSyncingModals = false;
  }
}

function renderMain(route: RouteState): void {
  const main = document.querySelector<HTMLElement>('#main');
  if (!main || !modals.details) throw new Error('Application layout is missing');

  let page: HTMLElement[];
  if (route.page === 'library') {
    page = createLibraryPage({ route, details: modals.details, onRouteChange: navigate });
    main.className = 'library-page container';
  } else if (route.page === 'home') {
    page = createHomePage(modals.details);
    main.className = 'home-page container';
  } else {
    page = createNotFoundPage(() => navigate({ page: 'home', game: undefined, auth: undefined }));
    main.className = 'not-found container';
  }

  main.replaceChildren(...page);
  routerState.renderedRoute = route;
  updateActiveLinks();
}

function syncFromUrl(): void {
  const route = readRoute();
  if (shouldRenderPage(route)) renderMain(route);
  syncModals(route);
}

function navigate(update: RouteUpdate): void {
  const url = routeUrl(update);
  if (new URL(url, location.origin).href !== location.href) history.pushState({}, '', url);
  syncFromUrl();
}

function renderLayout(): void {
  const main = element('main');
  main.id = 'main';
  appElement.replaceChildren(createHeader(), createBurgerMenu(), main, createFooter());

  const details = createDetailsDialog({
    onOpen: (game) => navigate({ game, auth: undefined }),
    onClose: () => {
      if (!routerState.isSyncingModals) navigate({ game: undefined });
    },
  });
  const authRoot = createAuthModal();
  const auth = initializeAuthModal(authRoot, {
    onOpen: (mode) => navigate({ auth: mode, game: undefined }),
    onClose: () => {
      if (!routerState.isSyncingModals) navigate({ auth: undefined });
    },
    onModeChange: (mode) => navigate({ auth: mode }),
  });

  appElement.append(details.root, authRoot);
  modals.details = details;
  modals.auth = auth;
}

function updateActiveLinks(): void {
  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    '.header__link, .burger-menu__link, .footer__link',
  )) {
    link.classList.toggle('is-active', location.pathname === link.getAttribute('href'));
  }
}

document.addEventListener('click', (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest<HTMLAnchorElement>('a[href]');
  if (!anchor || !isAppUrl(anchor)) return;

  event.preventDefault();
  const url = new URL(anchor.href);
  if (url.href !== location.href) history.pushState({}, '', `${url.pathname}${url.search}`);
  syncFromUrl();
});

addEventListener('popstate', syncFromUrl);
renderLayout();
syncFromUrl();
