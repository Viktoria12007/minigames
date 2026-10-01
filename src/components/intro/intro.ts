import { add, button, element } from '../../shared/dom.ts';

export type Category = { slug: string; label: string; isDefault: boolean };

const sortOptions = [
  { value: 'rating-desc', label: 'Rating ↓' },
  { value: 'rating-asc', label: 'Rating ↑' },
  { value: 'name-asc', label: 'Name A→Z' },
  { value: 'name-desc', label: 'Name Z→A' },
] as const;

type IntroOptions = {
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
};

export default function createIntro({ onCategoryChange, onSortChange }: IntroOptions) {
  const intro = element('div', 'library-page__intro');
  const title = element('h1', 'library-page__title', 'Game Library');
  const lead = element('p', 'library-page__lead', 'Browse our collection of casual mini-games');
  const controls = element('div', 'library-controls');
  const chips = element('div', 'library-controls__chips');
  const sort = element('div', 'library-controls__sort');
  const sortList = element('div', 'library-controls__sort-list');
  const sortButton = button('', 'library-controls__sort-button');
  let categories: Category[] = [];
  let selectedCategory = 'all';
  let selectedSort = 'rating-desc';

  const renderChips = () => {
    chips.replaceChildren(
      ...categories.map((category) => {
        const chip = button(category.label, 'library-controls__chip');
        chip.classList.toggle('is-active', category.slug === selectedCategory);
        chip.addEventListener('click', () => {
          if (selectedCategory === category.slug) return;
          selectedCategory = category.slug;
          renderChips();
          onCategoryChange(selectedCategory);
        });
        return chip;
      }),
    );
  };

  const renderSort = () => {
    const activeSort =
      sortOptions.find((option) => option.value === selectedSort) ?? sortOptions[0];
    sortButton.textContent = `Sort by: ${activeSort.label}`;
    sortList.replaceChildren(
      ...sortOptions.map((option) => {
        const item = button(option.label, 'library-controls__sort-option');
        item.classList.toggle('is-active', option.value === selectedSort);
        item.addEventListener('click', () => {
          sort.classList.remove('is-open');
          if (selectedSort === option.value) return;
          selectedSort = option.value;
          renderSort();
          onSortChange(selectedSort);
        });
        return item;
      }),
    );
  };

  sortButton.addEventListener('click', () => sort.classList.toggle('is-open'));
  renderSort();
  add(intro, title, lead);
  add(sort, sortButton, sortList);
  add(controls, chips, sort);

  return {
    intro,
    controls,
    setCategories(apiCategories: Category[]) {
      categories = apiCategories;
      selectedCategory = categories.find((category) => category.isDefault)?.slug ?? 'all';
      renderChips();
    },
  };
}
