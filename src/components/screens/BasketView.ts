import { EventEmitter } from '../base/events';
import { BasketItem } from '../common/BasketItem';
import { IProduct } from '../../types';
import { createElement, ensureElement } from '../../utils/utils';


type BasketRenderData = {
	items: Array<IProduct & { index: number }>;
	total: number;
	selected: string[];
};

export class BasketView {
	private template: HTMLTemplateElement;
	private element: HTMLElement;
	private list: HTMLElement;
	private total: HTMLElement;
	private button: HTMLButtonElement;

	constructor(
		private events: EventEmitter,
	) {
		this.template  = document.getElementById('basket') as HTMLTemplateElement;
		this.element = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		this.list = ensureElement('.basket__list',  this.element);
		this.total = ensureElement('.basket__price', this.element);
		this.button = ensureElement<HTMLButtonElement>('.basket__button', this.element);

		this.button.addEventListener('click', () => this.events.emit('order:open'));
	}

	update({items, total, selected}: BasketRenderData): void {
		if (items.length) {
			const rows = items.map((p, i) => new BasketItem(p, i, this.events).render());
			this.list.replaceChildren(...rows);
		} else {
			this.list.replaceChildren(
				createElement('p', { textContent: 'Корзина пуста' })
			);
		};

		this.total.textContent = `${total} синапсов`;

		this.button.disabled = selected.length === 0;
	}

	render(): HTMLElement {
		return this.element;
	}
}
