import { jest } from '@jest/globals';

const getApi = jest.fn<(path: string) => Promise<{ data: unknown }>>();
const showSnackbar = jest.fn<(text: string, variant: 'success' | 'error') => void>();
jest.unstable_mockModule('../shared/api', () => ({ getApi }));
jest.unstable_mockModule('./snackbar/snackbar', () => ({ showSnackbar }));
const { createGamesSection } = await import('./games/games');
const { createLeaderboard } = await import('./leaderboard/leaderboard');
const { createDeveloper } = await import('./developer/developer');
const { createHero } = await import('./hero/hero');
const { default: createNotFoundPage } = await import('../pages/not-found');

describe('content views', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      value: jest.fn(() => ({ matches: false })),
    });
  });

  it('renders featured games and opens details from a card', async () => {
    getApi.mockResolvedValue({
      data: [
        {
          slug: 'cat',
          name: 'Cat',
          cardImage: 'https://test/cat.jpg',
          rating: 4,
          likesCount: 1000,
        },
      ],
    });
    const open = jest.fn();
    const section = createGamesSection({ open });
    document.body.append(section);
    await new Promise<void>(queueMicrotask);
    expect(section.textContent).toContain('Cat');
    (section.querySelector('.games__card') as HTMLElement).click();
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ slug: 'cat' }));
  });

  it('renders leaderboard records and a retryable API failure', async () => {
    getApi.mockResolvedValueOnce({
      data: [
        {
          rank: 1,
          playerName: 'Ada Lovelace',
          gamesPlayed: 3,
          totalScore: 2500,
          streakDays: 1,
          favoriteGameName: 'Cat',
        },
      ],
    });
    const board = createLeaderboard();
    document.body.append(board);
    await new Promise<void>(queueMicrotask);
    expect(board.textContent).toContain('Ada Lovelace');

    getApi.mockRejectedValueOnce(new Error('offline'));
    const failed = createLeaderboard();
    document.body.append(failed);
    await new Promise<void>(queueMicrotask);
    expect(failed.textContent).toContain('Could not load top players');
    expect(showSnackbar).toHaveBeenCalledWith(
      'Top players could not be loaded. Please try again.',
      'error',
    );
  });

  it('builds static view structure and invokes the 404 return action', () => {
    expect(createHero().querySelector('a')?.getAttribute('href')).toContain('/minigames/library');
    expect(createDeveloper().textContent).toContain('Game Developer');
    const home = jest.fn();
    const page = createNotFoundPage(home);
    (page[2] as HTMLButtonElement).click();
    expect(home).toHaveBeenCalled();
  });
});
