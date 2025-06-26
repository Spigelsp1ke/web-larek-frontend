import { IProduct } from '../../types';
import { EventEmitter } from '../base/events';

export class BasketItem {
	private element: HTMLElement;

	constructor(
		private product: IProduct,
		private index: number,
		private events: EventEmitter,
	) {
		const tmpl = document.getElementById('card-basket') as HTMLTemplateElement;
		this.element = tmpl.content.firstElementChild!.cloneNode(true) as HTMLElement;

		this.element.querySelector('.basket__item-index')!.textContent = String(index + 1);
		this.element.querySelector('.card__title')!.textContent = product.title;
		this.element.querySelector('.card__price')!.textContent = `${product.price ?? '0'} синапсов`;

		this.element.querySelector('.basket__item-delete')!
			.addEventListener('click', () => this.events.emit('basket:remove', { id: product.id }));
	}

	render(): HTMLElement {
		return this.element;
	}
}