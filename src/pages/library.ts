import { add, element } from '../shared/dom.ts';
import createIntro from '../components/intro/intro.ts';
import createDetailsDialog from "../components/details-dialog/details-dialog.ts";
import createCards from "../components/cards/cards.ts";

export default function createLibraryPage() {
  const main = element('main', 'library-page container');
  main.id = 'library';
  const { intro, controls } = createIntro();
  const details = createDetailsDialog();
  add(main, intro, controls, createCards(details), details.root);
  return main;
}
