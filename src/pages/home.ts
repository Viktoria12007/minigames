import { createHero } from '../components/hero/hero.ts';
import { createGamesSection } from '../components/games/games.ts';
import { createLeaderboard } from '../components/leaderboard/leaderboard.ts';
import { createDeveloper } from '../components/developer/developer.ts';
import createDetailsDialog from '../components/details-dialog/details-dialog.ts';

export default function createHomePage(details: ReturnType<typeof createDetailsDialog>) {
  return [createHero(), createGamesSection(details), createLeaderboard(), createDeveloper()];
}
