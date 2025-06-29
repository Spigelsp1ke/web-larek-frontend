import { Model } from './base/Model';
import { EventEmitter } from './base/events';
import {
	FormErrors,
	IAppState,
	IOrder,
	IProduct,
	PaymentMethod,
} from '../types';

export class ShopState extends Model<IAppState> {
	catalog: IProduct[] = [];
	order: IOrder = {
		items: [],
		email: '',
		phone: '',
		address: '',
		payment: null,
		total: 0,
	};
	loading = false;
	preview: string | null = null;
	formErrors: FormErrors = {};

	constructor(events: EventEmitter) {
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

	setOrderField<K extends keyof IOrder>(key: K, value: IOrder[K]) {
		this.order[key] = value;
		this.validateOrder();
	}

	private validateOrder(): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!this.order.address?.trim()) {
			errors.push('Введите адрес доставки');
		}

		if (!this.order.payment) {
			errors.push('Выберите способ оплаты');
		}

		if (this.order.email !== undefined && this.order.email !== '') {
			errors.push('Введите корректный email');
		}

		if (this.order.phone !== undefined && this.order.phone !== '') {
			errors.push('Введите корректный номер телефона');
		}

		const result = {
			valid: errors.length === 0,
			errors,
		};

		this.events.emit('order:validated', result);

		return result;
	}

	validateStep1(): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!this.order.address?.trim()) {
			errors.push('Введите адрес доставки');
		}

		if (!this.order.payment) {
			errors.push('Выберите способ оплаты');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	}

	validateStep2(): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!this.order.email?.trim() || !/\S+@\S+\.\S+/.test(this.order.email)) {
			errors.push('Введите корректный email');
		}

		if (
			!this.order.phone?.trim() ||
			this.order.phone.replace(/\D/g, '').length < 11
		) {
			errors.push('Введите корректный номер телефона');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	}

	validate(): { valid: boolean; errors: string[] } {
		return this.validateOrder();
	}
	clearBasket() {
		this.order.items = [];
		this.order.total = 0;
		this.emit('basket:update', { items: [] });
	}
	getTotal() {
		return this.order.items.reduce(
			(a, c) => a + this.catalog.find((it) => it.id === c).price,
			0
		);
	}
	setCatalog(catalog: IProduct[]) {
		this.catalog = catalog;
		this.events.emit('catalog:change', { catalog });
	}
}
