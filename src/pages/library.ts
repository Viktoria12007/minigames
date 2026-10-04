import createCards, { type LibraryGame } from '../components/cards/cards.ts';
import createDetailsDialog from '../components/details-dialog/details-dialog.ts';
import createIntro, { type Category } from '../components/intro/intro.ts';
import createPagination from '../components/pagination/pagination.ts';
import { showSnackbar } from '../components/snackbar/snackbar.ts';
import { getApi } from '../shared/api.ts';
import { add, element } from '../shared/dom.ts';
import type { RouteState } from '../shared/router.ts';

type GamesMeta = {
  page: number;
  totalPages: number;
};

const pageSize = 6;

type LibraryPageOptions = {
  route: RouteState;
  onRouteChange: (update: Partial<Pick<RouteState, 'category' | 'sort' | 'currentPage'>>) => void;
  details: ReturnType<typeof createDetailsDialog>;
};

export default function createLibraryPage({ route, onRouteChange, details }: LibraryPageOptions) {
  const category = route.category;
  const sort = route.sort;
  let page = route.currentPage;
  let requestId = 0;
  const cards = createCards(details);
  const pagination = createPagination((nextPage) => {
    if (nextPage === page || nextPage < 1) return;
    onRouteChange({ currentPage: nextPage });
  });
  const { intro, controls, setCategories } = createIntro({
    onCategoryChange(nextCategory) {
      onRouteChange({ category: nextCategory, currentPage: 1 });
    },
    onSortChange(nextSort) {
      onRouteChange({ sort: nextSort, currentPage: 1 });
    },
    category,
    sort,
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
      await loadGames();
    } catch {
      cards.error(() => void loadCategories());
      showSnackbar('Categories could not be loaded. Please try again.', 'error');
    }
  };

  add(section, intro, controls, cards.root, pagination.root);
  void loadCategories();
  return [section];
}
