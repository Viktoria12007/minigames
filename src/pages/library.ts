import { add, element } from '../shared/dom.ts';
import createIntro from '../components/intro/intro.ts';
import createDetailsDialog from '../components/details-dialog/details-dialog.ts';
import createCards from '../components/cards/cards.ts';
import createPagination from '../components/pagination/pagination.ts';

export default function createLibraryPage() {
  const main = element('main', 'library-page container');
  main.id = 'library';
  const { intro, controls } = createIntro();
  const details = createDetailsDialog();
  const section = element('section', 'library-page__section');
  add(section, intro, controls, createCards(details), createPagination());
  add(main, section, details.root);
  return main;
}
