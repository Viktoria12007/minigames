import './styles/main.scss';
import { createAuthModal, initializeAuthModal } from './components/auth/auth';
import createDetailsDialog from './components/details-dialog/details-dialog';
import { createFooter } from './components/footer/footer';
import { createBurgerMenu, createHeader } from './components/header/header';
import createHomePage from './pages/home';
import createLibraryPage from './pages/library';
import createNotFoundPage from './pages/not-found';
import { isAppUrl, readRoute, routeUrl, type RouteUpdate } from './shared/router';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('Application root is missing');

const appElement = app;

function navigate(update: RouteUpdate, shouldReplace = false): void {
  const url = routeUrl(update);
  if (`${import.meta.env.BASE_URL}${location.pathname}${location.search}` !== url) {
    history[shouldReplace ? 'replaceState' : 'pushState']({}, '', url);
  }
  renderPage();
}

function renderPage(): void {
  const route = readRoute();
  document.body.classList.remove('no-scroll');
  const details = createDetailsDialog({
    onOpen(game) {
      navigate({ game, auth: undefined });
    },
    onClose() {
      navigate({ game: undefined }, true);
    },
  });
  const main =
    route.page === 'library'
      ? createLibraryPage({
          route,
          details,
          onRouteChange(update) {
            navigate(update);
          },
        })
      : route.page === 'home'
        ? createHomePage(details, route)
        : createNotFoundPage(() => navigate({ page: 'home', game: undefined, auth: undefined }));
  const authModal = createAuthModal();
  const auth = initializeAuthModal(authModal, {
    onOpen(mode) {
      navigate({ auth: mode, game: undefined });
    },
    onClose() {
      navigate({ auth: undefined }, true);
    },
    onModeChange(mode) {
      navigate({ auth: mode }, true);
    },
  });

  appElement.replaceChildren(createHeader(), createBurgerMenu(), main, createFooter(), authModal);
  if (route.auth) auth.open(route.auth);
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
  renderPage();
});

addEventListener('popstate', renderPage);
renderPage();
