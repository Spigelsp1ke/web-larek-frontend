import {IEvents} from "../base/events";

export class ModalView {
  private root: HTMLElement;
  private content: HTMLElement;

  constructor(root: HTMLElement, private events: IEvents) {
    this.root    = root;
    this.content = root.querySelector('.modal__content') as HTMLElement;

    root.addEventListener('mousedown', e => {
      if (e.target === root) this.close();
    });

    root.querySelector('.modal__close')
      ?.addEventListener('click', () => this.close());

    this.content.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-close]')) {
        this.close();
      }
    });
  }

  open(fragment: Node) {
    this.content.replaceChildren(fragment);
    this.root.classList.add('modal_active');
    this.events.emit('modal:open');
  }

  close() {
    this.root.classList.remove('modal_active');
    this.content.innerHTML = '';
    this.events.emit('modal:close');
  }
}