import { jest } from '@jest/globals';

const getApi = jest.fn<(path: string) => Promise<{ data: unknown; meta?: unknown }>>();
const postApi =
  jest.fn<(path: string, payload: Record<string, string>) => Promise<{ data: unknown }>>();
const checkAppSession = jest.fn<() => { session?: { email: string; displayName: string } }>();
const showSnackbar = jest.fn<(text: string, variant: 'success' | 'error') => void>();
jest.unstable_mockModule('../../shared/api', () => ({ getApi, postApi }));
jest.unstable_mockModule('../../shared/session', () => ({ checkAppSession }));
jest.unstable_mockModule('../snackbar/snackbar', () => ({ showSnackbar }));
const { default: createDetailsDialog, relativeTime } = await import('./details-dialog');

const game = {
  slug: 'cat',
  name: 'Cat Game',
  heroImage: 'https://example.test/cat.jpg',
  rating: 4.5,
  likesCount: 10,
  fullDescription: 'A cozy game',
  specs: { Genre: 'Puzzle' },
  topRecords: [
    { position: 1, playerName: 'Ada', score: 1200, achievedAt: new Date().toISOString() },
  ],
};

describe('game details dialog', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    jest.clearAllMocks();
    checkAppSession.mockReturnValue({
      session: { email: 'player@example.com', displayName: 'Player' },
    });
    getApi.mockImplementation((path: string) =>
      Promise.resolve(
        path.includes('/comments') ? { data: [], meta: { totalComments: 0 } } : { data: game },
      ),
    );
  });

  it('renders relative timestamps across time ranges', () => {
    const now = Date.parse('2026-01-02T00:00:00Z');
    expect(relativeTime('2026-01-01T23:59:30Z', now)).toBe('just now');
    expect(relativeTime('2026-01-01T22:00:00Z', now)).toBe('2 hours ago');
    expect(relativeTime('2025-01-01T00:00:00Z', now)).toBe('1 year ago');
  });

  it('loads a game and comments, toggles favorite, posts a comment and closes', async () => {
    const dialog = createDetailsDialog();
    document.body.append(dialog.root);
    dialog.openBySlug('cat');
    await new Promise<void>(queueMicrotask);
    await new Promise<void>(queueMicrotask);
    expect(dialog.root.textContent).toContain('Cat Game');
    expect(getApi).toHaveBeenCalledWith('/games/cat?userEmail=player%40example.com');

    postApi.mockResolvedValueOnce({ data: { isFavorited: true, likesCount: 11 } });
    (document.querySelector('.game-dialog__favorite') as HTMLButtonElement).click();
    await new Promise<void>(queueMicrotask);
    expect(postApi).toHaveBeenCalledWith('/games/cat/favorite', {
      userEmail: 'player@example.com',
    });
    expect(document.querySelector('.game-dialog__favorite')?.getAttribute('aria-label')).toBe(
      'In Favorites',
    );

    const textarea = document.querySelector('.game-dialog__textarea') as HTMLTextAreaElement;
    textarea.value = 'Nice game';
    postApi.mockResolvedValueOnce({ data: { commentId: 'next' } });
    (document.querySelector('.game-dialog__form') as HTMLFormElement).requestSubmit();
    await new Promise<void>(queueMicrotask);
    expect(postApi).toHaveBeenCalledWith(
      '/games/cat/comments',
      expect.objectContaining({ text: 'Nice game' }),
    );
    expect(showSnackbar).toHaveBeenCalledWith('Comment posted.', 'success');
    dialog.close();
    expect(dialog.root.classList.contains('is-open')).toBe(false);
  });

  it('renders an error and reports it when game loading fails', async () => {
    getApi.mockRejectedValue(new Error('offline'));
    const dialog = createDetailsDialog();
    document.body.append(dialog.root);
    dialog.openBySlug('cat');
    await new Promise<void>(queueMicrotask);
    expect(dialog.root.textContent).toContain('Could not load game');
    expect(showSnackbar).toHaveBeenCalledWith(
      'Game details could not be loaded. Please try again.',
      'error',
    );
  });
});
