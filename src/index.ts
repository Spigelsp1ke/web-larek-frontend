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
import { BasketItem } from './components/common/BasketItem';

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

events.on<{ id: string }>('basket:add', ({ id }) => {
	state.addItem(id);
});

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

	const disabled =
      product.price === null ||
      state.order.items.includes(id);

	modal.open(views.preview.show(product, disabled));
});

events.on('basket:update', () => {
	const items: HTMLElement[] = [];
	let total = 0;

	state.order.items.forEach((id, index) => {
			const product = state.catalog.find((p) => p.id === id);
			if (!product) return null;

			total += product.price;

			const item = new BasketItem(product, index, events).render();
            items.push(item);
		})

	state.order.total = total;

	views.basket.update({
		items,
		total,
		selected: state.order.items,
	});
});

events.on('basket:open', () => {
	modal.open(views.basket.render());
});

events.on('order:open', () => {
  events.emit('order:step1:validated', state.validateStep1());
  modal.open(views.orderAddress.element);
});

events.on('order:step1:complete', () => {
  events.emit('order:step2:validated', state.validateStep2());
  modal.open(views.orderContacts.element);
});

events.on<{ valid: boolean; errors: string[] }>('order:step1:validated', ({ valid, errors }) => views.orderAddress.updateValidation({ valid, errors }));
events.on<{ valid: boolean; errors: string[] }>('order:step2:validated', ({ valid, errors }) => views.orderContacts.updateValidation({ valid, errors }));

events.on('order:complete', async() => {
	try {
		const orderSnapshot = { ...state.order };
		const result = await api.createOrder(orderSnapshot);
		state.clearBasket();
		Object.assign(state.order, {
            address: '',
            payment: null,
            email  : '',
            phone  : ''
        });

		views.orderAddress.clear();
        views.orderContacts.clear();
		events.emit('order:step1:validated', { valid: false, errors: [] });
        events.emit('order:step2:validated', { valid: false, errors: [] });

		modal.open(views.success.show(result));
	} catch (e) {
		alert('Не удалось оформить заказ: ' + e);
	    }
    }	
);

events.on<{ key: string; value: string }>('order:change', ({ key, value }) => {
	state.setOrderField(key as keyof typeof state.order, value);

	const step1 = ['address', 'payment'];
	const step2 = ['email', 'phone'];

	if (step1.includes(key)) {
		events.emit('order:step1:validated', state.validateStep1());
	} else if (step2.includes(key)) {
		events.emit('order:step2:validated', state.validateStep2());
	}
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

(async () => {
  try {
    const catalog = await api.getCatalog();
    state.setCatalog(catalog);
    events.emit('catalog:change', { catalog });
  } catch (err) {
    console.error('Не удалось получить каталог:', err);
    alert('Каталог недоступен. Попробуйте позже.');
  }
})();

events.onAll(({ eventName, data }) => console.log(eventName, data));
