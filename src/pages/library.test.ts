import { jest } from '@jest/globals';

const getApi = jest.fn<(path: string) => Promise<{ data: unknown; meta?: unknown }>>();
const postApi =
  jest.fn<(path: string, payload: Record<string, string>) => Promise<{ data: unknown }>>();
const showSnackbar = jest.fn<(text: string, variant: 'success' | 'error') => void>();
jest.unstable_mockModule('../shared/api', () => ({ getApi, postApi }));
jest.unstable_mockModule('../shared/session', () => ({
  checkAppSession: jest.fn(() => ({ status: 'guest' })),
}));
jest.unstable_mockModule('../components/snackbar/snackbar', () => ({ showSnackbar }));
const { default: createLibraryPage } = await import('./library');

const route = { page: 'library' as const, category: 'all', sort: 'rating-desc', currentPage: 1 };

describe('library page', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      value: jest.fn(() => ({ matches: false })),
    });
  });

  it('loads categories once and builds a query for paginated games', async () => {
    getApi.mockImplementation((path: string) =>
      Promise.resolve(
        path === '/categories'
          ? {
              data: [
                { slug: 'all', label: 'All', isDefault: true },
                { slug: 'puzzle', label: 'Puzzle', isDefault: false },
              ],
            }
          : {
              data: [
                {
                  slug: 'cat',
                  name: 'Cat',
                  category: 'Puzzle',
                  price: 'Free',
                  shortDescription: 'Fun',
                  rating: 4,
                  likesCount: 5,
                  cardImage: 'https://test/cat.jpg',
                },
              ],
              meta: { page: 1, totalPages: 2 },
            },
      ),
    );
    const change = jest.fn();
    const [page] = createLibraryPage({
      route,
      onRouteChange: change,
      details: { open: jest.fn() },
    } as never);
    document.body.append(page);
    await new Promise<void>(queueMicrotask);
    await new Promise<void>(queueMicrotask);
    expect(getApi).toHaveBeenCalledWith('/categories');
    expect(getApi).toHaveBeenCalledWith('/games?page=1&limit=6&sort=rating-desc');
    (document.querySelector('[aria-label="Next page"]') as HTMLButtonElement).click();
    expect(change).toHaveBeenCalledWith({ currentPage: 2 });
  });
});
