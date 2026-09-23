import { add, element } from '../shared/dom.ts';
import createIntro from '../components/intro/intro.ts';

export default function createLibraryPage() {
  const main = element('main', 'library-page container');
  main.id = 'library';
  const { intro, controls } = createIntro();
  add(main, intro, controls);
  return main;
}
