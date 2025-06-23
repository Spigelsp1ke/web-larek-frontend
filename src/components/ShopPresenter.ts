import { EventEmitter }   from './base/events';
import { MarketAPI }      from './MarketAPI';
import { ShopState }      from './AppData';
import { Page }           from './common/Page';
import { ModalView }      from './common/Modal';

import { CatalogView }        from './screens/CatalogView';
import { PreviewView }        from './screens/PreviewView';
import { BasketView }         from './screens/BasketView';
import { OrderAddressView }   from './screens/OrderAddressView';
import { OrderContactsView }  from './screens/OrderContactsView';
import { SuccessView }        from './screens/SuccessView';
import { IProduct } from '../types';

const events = new EventEmitter();
const state = new ShopState(events);

export function initShop(
	api: MarketAPI,
	state: ShopState,
	page: Page,
	modal: ModalView,
	events: EventEmitter,
): EventEmitter {

	const views = {
		catalog:        new CatalogView(page, events),
		preview:        new PreviewView(modal, events),
		basket:         new BasketView(modal, events, state),
		orderAddress:   new OrderAddressView(modal, events, state),
		orderContacts:  new OrderContactsView(modal, events, state),
		success:        new SuccessView(modal, events),
	};

	events.on<{ catalog: IProduct[] }>('catalog:change', ({ catalog }) => events.emit('ui:catalog', { catalog }));
	events.on<{ items: string[] }>('basket:update',  ({ items  }) => events.emit('ui:basket-counter', { qty: items.length }));

	events.on<{ id: string }>('basket:add',    ({ id }) => state.addItem(id));
	events.on<{ id: string }>('basket:remove', ({ id }) => state.removeItem(id));

	events.on<{ id: string }>('card:select',   ({ id }) => {
		const product = state.catalog.find(p => p.id === id);
		if (product) views.preview.show(product);
	});

	events.on('basket:open', () => views.basket.show());

	events.on('order:open', () => views.orderAddress.show());

	events.on<{ address: string; payment: 'card' | 'cash' }>('order:step1:complete', data => {
		state.order.address  = data.address;
		state.order.payment  = data.payment;
		views.orderContacts.show();
	});

	events.on<{ email: string; phone: string }>('order:complete', async ({ email, phone }) => {
		state.order.email = email;
		state.order.phone = phone;
		state.order.total = state.getTotal();

		try {
			const result = await api.order(state.order);
			state.clearBasket();
			views.success.show(result);
		} catch (e) {
			alert('Не удалось оформить заказ: ' + e);
		}
	});

	(async () => state.setCatalog(await api.getCatalog()))();

	return events;
}