import createCards from './cards/cards';
import createIntro from './intro/intro';
import createPagination from './pagination/pagination';
import { jest } from '@jest/globals';

describe('library controls', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      value: jest.fn(() => ({ matches: false })),
    });
  });

  it('updates pagination and reports a clicked page', () => {
    const change = jest.fn();
    const pagination = createPagination(change);
    pagination.update(2, 4);
    document.body.append(pagination.root);
    expect(document.querySelector('[aria-current="page"]')?.textContent).toBe('2');
    (document.querySelector('[aria-label="Next page"]') as HTMLButtonElement).click();
    expect(change).toHaveBeenCalledWith(3);
  });

  it('reports selected category and sort while ignoring repeated selections', () => {
    const categoryChange = jest.fn();
    const sortChange = jest.fn();
    const intro = createIntro({
      category: 'all',
      sort: 'rating-desc',
      onCategoryChange: categoryChange,
      onSortChange: sortChange,
    });
    intro.setCategories([
      { slug: 'all', label: 'All', isDefault: true },
      { slug: 'puzzle', label: 'Puzzle', isDefault: false },
    ]);
    document.body.append(intro.controls);
    (
      [...document.querySelectorAll('.library-controls__chip')].find(
        (node) => node.textContent === 'Puzzle',
      ) as HTMLButtonElement
    ).click();
    expect(categoryChange).toHaveBeenCalledWith('puzzle');
    (document.querySelector('.library-controls__sort-button') as HTMLButtonElement).click();
    (
      [...document.querySelectorAll('.library-controls__sort-option')].find((node) =>
        node.textContent?.includes('Name A'),
      ) as HTMLButtonElement
    ).click();
    expect(sortChange).toHaveBeenCalledWith('name-asc');
  });

  it('renders cards, empty state and retryable error state', () => {
    const open = jest.fn();
    const cards = createCards({ open });
    cards.render([
      {
        slug: 'cat',
        name: 'Cat',
        category: 'Puzzle',
        price: 'Free',
        shortDescription: 'Fun',
        rating: 4.5,
        likesCount: 1200,
        cardImage: '/cat.jpg',
      },
    ]);
    document.body.append(cards.root);
    (document.querySelector('.library-card__details') as HTMLButtonElement).click();
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ slug: 'cat' }));
    cards.empty();
    expect(cards.root.textContent).toContain('Data Not Found');
    const retry = jest.fn();
    cards.error(retry);
    (document.querySelector('.library-list__retry') as HTMLButtonElement).click();
    expect(retry).toHaveBeenCalled();
  });
});
