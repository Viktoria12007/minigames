import './styles/main.scss';
import { createAuthModal, initializeAuthModal } from './components/auth/auth';
import { createFooter } from './components/footer/footer';
import { createBurgerMenu, createHeader } from './components/header/header';
import createLibraryPage from './pages/library';
import createHomePage from './pages/home';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('Application root is missing');

const appElement = app;

function renderPage(): void {
  const isLibrary = location.hash === '#library';
  const main = isLibrary ? createLibraryPage() : createHomePage();
  const authModal = createAuthModal();
  appElement.replaceChildren(createHeader(), createBurgerMenu(), main, createFooter(), authModal);
  initializeAuthModal(authModal);
}

addEventListener('hashchange', renderPage);
renderPage();
