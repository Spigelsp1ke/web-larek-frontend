import { EventEmitter } from '../base/events';
import { ModalView }    from '../common/Modal';
import { IProduct }     from '../../types';
import { ProductCard }  from '../ProductCard';

export class PreviewView {
	private template: HTMLTemplateElement;

	constructor(
		private modal: ModalView,
		private events: EventEmitter,
	) {
		this.template = document.getElementById('card-preview') as HTMLTemplateElement;
	}

	show(product: IProduct) {
		const node  = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		const view  = new ProductCard(node, {
			onClick: () => {
				this.events.emit('basket:add', { id: product.id });
				this.modal.close();
			},
		});
		Object.assign(view, product, { description: product.description });
		this.modal.open(node);
	}
}