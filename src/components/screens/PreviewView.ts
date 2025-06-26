import { EventEmitter } from '../base/events';
import { IProduct }     from '../../types';
import { ProductCard }  from '../common/ProductCard';

export class PreviewView {
	private template: HTMLTemplateElement;
	private element: HTMLElement;

	constructor(
		private events: EventEmitter,
	) {
		this.template = document.getElementById('card-preview') as HTMLTemplateElement;
		this.element  = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
	}

	show(product: IProduct): HTMLElement {
		const card = new ProductCard(this.element, {
			onClick: () => {
				this.events.emit('basket:add', { id: product.id });
				this.events.emit('modal:request-close', {});
			},
		});

		Object.assign(card, product, { description: product.description });

		return card.render();
	}
}