export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function add(parent: Element, ...children: Array<Node | null | undefined>): void {
  parent.append(
    ...children.filter((child): child is Node => child !== null && child !== undefined),
  );
}

export function link(text: string, href: string, className?: string): HTMLAnchorElement {
  const node = element('a', className, text);
  node.href = href;
  return node;
}

export function button(text: string, className?: string): HTMLButtonElement {
  return element('button', className, text);
}
