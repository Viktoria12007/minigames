import { add, element } from '../shared/dom.ts';
import { createHero } from '../components/hero/hero.ts';
import { createGamesSection } from '../components/games/games.ts';
import { createLeaderboard } from '../components/leaderboard/leaderboard.ts';
import { createDeveloper } from '../components/developer/developer.ts';

export default function createHomePage() {
  const main = element('main', 'home-page container');
  main.id = 'home';
  add(main, createHero(), createGamesSection(), createLeaderboard(), createDeveloper());
  return main;
}
