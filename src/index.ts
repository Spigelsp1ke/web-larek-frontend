import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement } from './utils/utils';

import { EventEmitter } from './components/base/events';
import { MarketAPI } from './components/MarketAPI';
import { ShopState } from './components/AppData';
import { Page } from './components/common/Page';
import { ModalView } from './components/screens/ModalView';

import { CatalogView } from './components/screens/CatalogView';
import { PreviewView } from './components/screens/PreviewView';
import { BasketView } from './components/screens/BasketView';
import { OrderAddressView } from './components/screens/OrderAddressView';
import { OrderContactsView } from './components/screens/OrderContactsView';
import { SuccessView } from './components/screens/SuccessView';
import { IProduct } from './types';

const events = new EventEmitter();
const state = new ShopState(events);

const api = new MarketAPI(CDN_URL, API_URL);

const page = new Page(document.body, events);
const modal = new ModalView(
	ensureElement<HTMLElement>('#modal-container'),
	events
);

const views = {
	catalog: new CatalogView(events),
	preview: new PreviewView(events),
	basket: new BasketView(events),
	orderAddress: new OrderAddressView(events),
	orderContacts: new OrderContactsView(events),
	success: new SuccessView(),
};

events.on<{ catalog: IProduct[] }>('catalog:change', ({ catalog }) =>
	events.emit('ui:catalog', { catalog })
);
events.on<{ items: string[] }>('basket:update', ({ items }) =>
	events.emit('ui:basket-counter', { qty: items.length })
);

events.on<{ id: string }>('basket:add', ({ id }) => state.addItem(id));
events.on<{ id: string }>('basket:remove', ({ id }) => state.removeItem(id));

events.on<{ qty: number }>('ui:basket-counter', ({ qty }) => {
	page.counter = qty;
});

events.on<{ catalog: IProduct[] }>('ui:catalog', ({ catalog }) => {
	views.catalog.render(catalog);
});

events.on<{ id: string }>('card:select', ({ id }) => {
	const product = state.catalog.find((p) => p.id === id);
	if (!product) return;
	modal.open(views.preview.show(product));
});

events.on('basket:update', () => {
	const items = state.order.items
		.map((id, index) => {
			const product = state.catalog.find((p) => p.id === id);
			if (!product) return null;
			return { ...product, index };
		})
		.filter(Boolean);

	const total = items.reduce((sum, p) => sum + p.price, 0);

	views.basket.update({
		items,
		total,
		selected: state.order.items,
	});
});

events.on('basket:open', () => {
	const items = state.order.items
    events.emit('basket:update', {
		items,
	})
	modal.open(views.basket.render());
});

events.on('order:open', () => modal.open(views.orderAddress.show()));

events.on<{ address: string; payment: 'card' | 'cash' }>(
	'order:step1:complete',
	(data) => {
		state.order.address = data.address;
		state.order.payment = data.payment;
		views.orderContacts.show();
		modal.open(views.orderContacts.show())
	}
);

events.on<{ email: string; phone: string }>(
	'order:complete',
	async ({ email, phone }) => {
		state.order.email = email;
		state.order.phone = phone;
		state.order.total = state.getTotal();

		try {
			const result = await api.createOrder(state.order);
			state.clearBasket();
			modal.open(views.success.show(result));
		} catch (e) {
			alert('Не удалось оформить заказ: ' + e);
		}
	}
);

events.on<{ key: string; value: string }>('order:change', ({ key, value }) => {
	state.setOrderField(key as keyof typeof state.order, value);

	if (['email', 'phone'].includes(key)) {
		const result = state.validateStep2();
		events.emit('order:step2:validated', result);
	}
	if (['address', 'payment'].includes(key)) {
		const result = state.validateStep1();
		events.emit('order:step1:validated', result);
	}
});

events.on('order:validate-step1', () => {
	state.validateStep1();
});

events.on('order:validate-step2', () => {
	state.validateStep2();
});

events.on('order:validate', () => {
	state.validate();
});

events.on('modal:request-close', () => {
  modal.close();
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

(async () => state.setCatalog(await api.getCatalog()))();

events.onAll(({ eventName, data }) => console.log(eventName, data));
