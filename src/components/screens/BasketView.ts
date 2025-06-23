import { EventEmitter } from '../base/events';
import { ModalView }    from '../common/Modal';
import { Basket }       from '../common/Basket';
import { ShopState }    from '../AppData';

export class BasketView {
	private template: HTMLTemplateElement;
	private component: Basket;

	constructor(
		private modal: ModalView,
		private events: EventEmitter,
		private state: ShopState,
	) {
		this.template  = document.getElementById('basket') as HTMLTemplateElement;
		const node     = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		this.component = new Basket(node, events);

		this.events.on('basket:update', () => this.update());
	}

	show() {
		this.update();
		this.modal.open(this.component.render());
	}

	private update() {
		const tmplRow = document.getElementById('card-basket') as HTMLTemplateElement;
		const rows: HTMLElement[] = [];
		let   sum  = 0;

		this.state.order.items.forEach((id, idx) => {
			const p = this.state.catalog.find(c => c.id === id);
			if (!p) return;
			sum += p.price;

			const li = tmplRow.content.firstElementChild!.cloneNode(true) as HTMLElement;
			li.querySelector('.basket__item-index')!.textContent = String(idx + 1);
			li.querySelector('.card__title')!.textContent        = p.title;
			li.querySelector('.card__price')!.textContent        = `${p.price ?? '0'} синапсов`;

			li.querySelector('.basket__item-delete')!
			   .addEventListener('click', () => this.events.emit('basket:remove', { id }));

			rows.push(li);
		});

		this.component.items    = rows;
		this.component.total    = sum;
		this.component.selected = this.state.order.items;
	}
}
