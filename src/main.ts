import './styles/main.scss';
import { createAuthModal, initializeAuthModal } from './components/auth/auth';
import createDetailsDialog from './components/details-dialog/details-dialog';
import { createFooter } from './components/footer/footer';
import {createBurgerMenu, createHeader} from './components/header/header';
import createHomePage from './pages/home';
import createLibraryPage from './pages/library';
import createNotFoundPage from './pages/not-found';
import {isAppUrl, readRoute, routeUrl, type RouteUpdate, type AuthMode} from './shared/router';
import type {FeaturedGame} from "./components/games/games.ts";
import {element} from "./shared/dom.ts";

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('Application root is missing');

const appElement = app;
type Game = FeaturedGame;
// let details;
// let auth;
const modals: {
    details: {
        root: HTMLElement;
        open: (game: Game) => void;
        openBySlug: (slug: string) => void;
        close: () => void;
    } | null;
    auth: {
    open: (mode: AuthMode) => void;
    close: () => void;
} | null
} = {
    details: null,
    auth: null,
}

function setStateModals() {
    const route = readRoute();
    if (modals.auth) {
        if (route.auth) {
            modals.auth.open(route.auth)
        } else {
            modals.auth.close();
        }
    }
    if (modals.details) {
        if (route.game) {
            modals.details.openBySlug(route.game)
        } else {
            modals.details.close();
        }
    }
}


function navigate(update: RouteUpdate, shouldRenderPage = true): void {
  const url = routeUrl(update);
  if (`${import.meta.env.BASE_URL}${location.pathname}${location.search}` !== url) {
    history.pushState({}, '', url);
  }
  if (shouldRenderPage) renderMain();
    setStateModals();
}

function renderLayout() {
    const main = element('main');
    main.id = 'main';
    appElement.replaceChildren(createHeader(), createBurgerMenu(), main, createFooter());
   const stateModals = renderModals();
    modals.details = stateModals.details;
    modals.auth = stateModals.auth;
}

function renderMain() {
    const route = readRoute();
    const main = document.querySelector('#main');
    if (!main) {
        throw new Error('Main element not found');
    }
    if (!modals.details) {
        throw new Error('Details dialog element not found');
    }
    let page;
    const details = modals.details;
    if (route.page === 'library') {
        page = createLibraryPage({
            route,
            details,
            onRouteChange(update) {
                navigate(update);
            },
        })
        main.className = 'library-page container';
    } else if (route.page === 'home') {
        page = createHomePage(details);
        main.className = 'home-page container';
    } else {
        page = createNotFoundPage(() => navigate({ page: 'home', game: undefined, auth: undefined }));
        main.className = 'not-found container';
    }
    main.replaceChildren(...page);
    updateActiveLinks();
}

function renderModals() {
  const details = createDetailsDialog({
    onOpen(game) {
      navigate({ game, auth: undefined }, false);
    },
    onClose() {
        document.body.classList.remove('no-scroll');
      navigate({ game: undefined }, false);
    },
  });

  const authModal = createAuthModal();
  const auth = initializeAuthModal(authModal, {
    onOpen(mode) {
      navigate({ auth: mode, game: undefined }, false);
    },
    onClose() {
        document.body.classList.remove('no-scroll');
      navigate({ auth: undefined }, false);
    },
    onModeChange(mode) {
      navigate({ auth: mode }, false);
    },
  });

    appElement.append(details.root, authModal);

    return {
        details,
        auth
    }
}

function updateActiveLinks() {
    const headerLinks = document.querySelectorAll('.header__link');
    for (const item of headerLinks) {
        item.classList.toggle('is-active', location.pathname === item.getAttribute('href'));
    }
    const burgerLinks = document.querySelectorAll('.burger-menu__link');
    for (const item of burgerLinks) {
        item.classList.toggle('is-active', location.pathname === item.getAttribute('href'));
    }
    const footerLinks = document.querySelectorAll('.footer__link');
    for (const item of footerLinks) {
        item.classList.toggle('is-active', location.pathname === item.getAttribute('href'));
    }
}

document.addEventListener('click', (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey
  )
    return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest<HTMLAnchorElement>('a[href]');
  if (!anchor || !isAppUrl(anchor)) return;
  event.preventDefault();
  const url = new URL(anchor.href);
  history.pushState({}, '', `${url.pathname}${url.search}`);
  renderMain();
});

addEventListener('popstate', () => {
    console.log('popstate');
    renderMain();
    setStateModals();
});
renderLayout();
renderMain();
setStateModals();
