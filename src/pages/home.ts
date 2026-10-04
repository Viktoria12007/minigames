// import { add, element } from '../shared/dom.ts';
import { createHero } from '../components/hero/hero.ts';
import { createGamesSection } from '../components/games/games.ts';
import { createLeaderboard } from '../components/leaderboard/leaderboard.ts';
import { createDeveloper } from '../components/developer/developer.ts';
import createDetailsDialog from '../components/details-dialog/details-dialog.ts';
// import type { RouteState } from '../shared/router.ts';

export default function createHomePage(
  details: ReturnType<typeof createDetailsDialog>,
  // route: RouteState,
) {
  // add(
  //   createHero(),
  //   createGamesSection(details),
  //   createLeaderboard(),
  //   createDeveloper(),
  //   details.root,
  // );
  // if (route.game) details.openBySlug(route.game);
  return [
      createHero(),
      createGamesSection(details),
      createLeaderboard(),
      createDeveloper()
  ];
}
