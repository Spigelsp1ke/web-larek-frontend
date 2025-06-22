import { Model } from './base/Model';
import { IEvents } from './base/events';
import { FormErrors, IAppState, IOrder, IProduct } from '../types';

export class ShopState extends Model<IAppState> {
	catalog: IProduct[] = [];
	order: IOrder = {
		items: [],
		email: '',
		phone: '',
		address: '',
		payment: 'card',
		total: 0,
	};
	loading = false;
	preview: string | null = null;
	formErrors: FormErrors = {};

	constructor(events: IEvents) {
		super({}, events);
	}

	addItem(id: string) {
		if (!this.order.items.includes(id)) {
			this.order.items.push(id);
			this.emit('basket:update', { items: this.order.items });
		}
	}

	removeItem(id: string) {
		const i = this.order.items.indexOf(id);
		if (i !== -1) {
			this.order.items.splice(i, 1);
			this.emit('basket:update', { items: this.order.items });
		}
	}
	clearBasket() {
		this.order.items = [];
		this.emit('basket:update', { items: [] });
	}
	getTotal() {
		return this.order.items.reduce(
			(a, c) => a + this.catalog.find((it) => it.id === c).price,
			0
		);
	}
	setCatalog(items: IProduct[]) {
		this.catalog = items;
		this.emit('catalog:change', { catalog: items });
	}
}
