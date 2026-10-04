import { button, element } from '../../shared/dom.ts';

export default function createPagination(onPageChange: (page: number) => void) {
  const pagination = element('nav', 'pagination');
  let activePage = 1;
  let totalPages = 1;

  const renderPagination = () => {
    const visible = matchMedia('(max-width: 480px)').matches ? 3 : 4;
    const count = Math.min(visible, totalPages);
    const start = Math.min(Math.max(1, activePage - 1), Math.max(1, totalPages - count + 1));
    const previous = button('‹', 'pagination__button');
    previous.disabled = activePage === 1;
    previous.setAttribute('aria-label', 'Previous page');
    previous.addEventListener('click', () => onPageChange(activePage - 1));
    const next = button('›', 'pagination__button');
    next.disabled = activePage === totalPages;
    next.setAttribute('aria-label', 'Next page');
    next.addEventListener('click', () => onPageChange(activePage + 1));
    const pages = Array.from({ length: count }, (_, index) => {
      const page = start + index;
      const item = button(String(page), 'pagination__button');
      item.classList.toggle('is-active', page === activePage);
      item.setAttribute('aria-current', page === activePage ? 'page' : 'false');
      item.addEventListener('click', () => onPageChange(page));
      return item;
    });
    pagination.replaceChildren(previous, ...pages, next);
  };

  addEventListener('resize', renderPagination);
  renderPagination();
  return {
    root: pagination,
    update(page: number, pages: number) {
      activePage = Math.max(1, page);
      totalPages = Math.max(1, pages);
      renderPagination();
    },
  };
}
