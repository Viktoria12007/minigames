import createCards, { type LibraryGame } from '../components/cards/cards.ts';
import createDetailsDialog from '../components/details-dialog/details-dialog.ts';
import createIntro, { type Category } from '../components/intro/intro.ts';
import createPagination from '../components/pagination/pagination.ts';
import { showSnackbar } from '../components/snackbar/snackbar.ts';
import { getApi } from '../shared/api.ts';
import { add, element } from '../shared/dom.ts';

type GamesMeta = {
  page: number;
  totalPages: number;
};

const pageSize = 6;

export default function createLibraryPage() {
  const main = element('main', 'library-page container');
  main.id = 'library';
  const details = createDetailsDialog();
  let category = 'all';
  let sort = 'rating-desc';
  let page = 1;
  let requestId = 0;
  const cards = createCards(details);
  const pagination = createPagination((nextPage) => {
    if (nextPage === page || nextPage < 1) return;
    page = nextPage;
    void loadGames();
  });
  const { intro, controls, setCategories } = createIntro({
    onCategoryChange(nextCategory) {
      category = nextCategory;
      page = 1;
      void loadGames();
    },
    onSortChange(nextSort) {
      sort = nextSort;
      page = 1;
      void loadGames();
    },
  });
  const section = element('section', 'library-page__section');

  const loadGames = async () => {
    const currentRequest = ++requestId;
    cards.loading();
    const parameters = new URLSearchParams({ page: String(page), limit: String(pageSize), sort });
    if (category !== 'all') parameters.set('category', category);
    try {
      const response = await getApi<LibraryGame[], GamesMeta>(`/games?${parameters}`);
      if (currentRequest !== requestId) return;
      const currentPage = Math.max(1, response.meta?.page ?? page);
      const totalPages = Math.max(1, response.meta?.totalPages ?? 1);
      page = currentPage;
      pagination.update(currentPage, totalPages);
      if (response.data.length === 0) {
        cards.empty();
        return;
      }
      cards.render(response.data);
    } catch {
      if (currentRequest !== requestId) return;
      pagination.update(page, 1);
      cards.error(() => void loadGames());
      showSnackbar('Games could not be loaded. Please try again.', 'error');
    }
  };

  const loadCategories = async () => {
    cards.loading();
    try {
      const response = await getApi<Category[]>('/categories');
      setCategories(response.data);
      category = response.data.find((item) => item.isDefault)?.slug ?? 'all';
      await loadGames();
    } catch {
      cards.error(() => void loadCategories());
      showSnackbar('Categories could not be loaded. Please try again.', 'error');
    }
  };

  add(section, intro, controls, cards.root, pagination.root);
  add(main, section, details.root);
  void loadCategories();
  return main;
}
