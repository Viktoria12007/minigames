import { add, button, element } from '../../shared/dom.ts';

const categories = ['All Games', 'Puzzle', 'Card', 'Match', 'Farm', 'Strategy', 'Arcade'];
const sortOptions = ['Rating ↑', 'Rating ↓', 'Name A→Z', 'Name Z→A'];

export default function createIntro() {
  const intro = element('section', 'library-page__intro');
  const title = element('h1', 'library-page__title', 'Game Library');
  const lead = element('p', 'library-page__lead', 'Browse our collection of casual mini-games');
  const controls = element('section', 'library-controls');
  const chips = element('div', 'library-controls__chips');
  const sort = element('div', 'library-controls__sort');
  const sortList = element('div', 'library-controls__sort-list');
  const sortButton = button('Sort by: Rating ↓', 'library-controls__sort-button');

  let selectedCategory = 'All Games';
  let selectedSort = 'Rating ↓';

  const renderChips = () => {
    chips.replaceChildren(
      ...categories.map((category) => {
        const chip = button(category, 'library-controls__chip');
        chip.classList.toggle('is-active', category === selectedCategory);
        chip.addEventListener('click', () => {
          selectedCategory = category;
          renderChips();
        });
        return chip;
      }),
    );
  };

  const renderSort = () => {
    sortButton.textContent = `Sort by: ${selectedSort}`;
    sortList.replaceChildren(
      ...sortOptions.map((option) => {
        const item = button(option, 'library-controls__sort-option');
        item.classList.toggle('is-active', option === selectedSort);
        item.addEventListener('click', () => {
          selectedSort = option;
          sort.classList.remove('is-open');
          renderSort();
        });
        return item;
      }),
    );
  };

  sortButton.addEventListener('click', () => sort.classList.toggle('is-open'));
  renderChips();
  renderSort();
  add(intro, title, lead);
  add(sort, sortButton, sortList);
  add(controls, chips, sort);

  return {
    intro,
    controls,
  };
}
