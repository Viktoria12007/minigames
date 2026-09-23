import './styles/main.scss';
import { createAuthModal, initializeAuthModal } from './components/auth/auth';
import { createDeveloper } from './components/developer/developer';
import { createFooter } from './components/footer/footer';
import { createGamesSection } from './components/games/games';
import { createBurgerMenu, createHeader } from './components/header/header';
import { createHero } from './components/hero/hero';
import { createLeaderboard } from './components/leaderboard/leaderboard';
import { add, element } from './shared/dom';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('Application root is missing');

const main = element('main');
main.id = 'home';
add(main, createHero(), createGamesSection(), createLeaderboard(), createDeveloper());

const authModal = createAuthModal();
add(app, createHeader(), createBurgerMenu(), main, createFooter(), authModal);
initializeAuthModal(authModal);
