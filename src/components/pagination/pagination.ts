import { button, element } from '../../shared/dom.ts';

export default function createPagination() {
  const pagination = element('nav', 'pagination');
  let activePage = 1;

  const mobile = matchMedia('(max-width: 480px)').matches;
  const visible = mobile ? 3 : 4;
  const start = Math.min(Math.max(1, activePage - 1), 5 - visible + 1);

  const previous = button('‹', 'pagination__button');
  previous.disabled = activePage === 1;
  previous.setAttribute('aria-label', 'Previous page');
  previous.addEventListener('click', () => {
    activePage--;
    renderPagination();
  });
  const next = button('›', 'pagination__button');
  next.disabled = activePage === 5;
  next.setAttribute('aria-label', 'Next page');
  next.addEventListener('click', () => {
    activePage++;
    renderPagination();
  });

  const renderPagination = () => {
    const pages = Array.from({ length: visible }, (_, index) => {
      const page = start + index;
      const item = button(String(page), 'pagination__button');
      item.classList.toggle('is-active', page === activePage);
      item.addEventListener('click', () => {
        activePage = page;
        renderPagination();
      });
      return item;
    });
    pagination.replaceChildren(previous, ...pages, next);
  };

  addEventListener('resize', renderPagination);
  renderPagination();
  return pagination;
}
