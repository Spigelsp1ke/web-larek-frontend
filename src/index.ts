import './scss/styles.scss';

import { MarketAPI } from './components/MarketAPI';
import { EventEmitter } from './components/base/events';
import { ShopState } from './components/AppData';
import { Page } from './components/common/Page';
import { ModalView } from './components/common/Modal';
import { initShop } from './components/shopPresenter';
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new MarketAPI(CDN_URL, API_URL);
const state = new ShopState(events);

const page = new Page(document.body, events);
const modal = new ModalView(
	ensureElement<HTMLElement>('#modal-container'),
	events
);

initShop(api, state, page, modal, events);

events.onAll(({ eventName, data }) => console.log(eventName, data));

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});
