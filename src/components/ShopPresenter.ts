import { IEvents } from './base/events';
import { MarketAPI } from './MarketAPI';
import { ShopState } from './AppData';
import { Page } from './common/Page';
import { Form } from './common/Form';
import { Basket } from './common/Basket';
import { ModalView } from './common/Modal';
import { ProductCard } from './ProductCard';
import {
	IOrderDataStep1,
	IOrderDataStep2,
	IOrderResponse,
	PaymentMethod,
} from '../types';

function onceModalClose(events: IEvents, fn: () => void) {
	let done = false;
	events.on('modal:close', () => {
		if (!done) {
			done = true;
			fn();
		}
	});
}

export class ShopPresenter {
	constructor(
		private api: MarketAPI,
		private state: ShopState,
		private page: Page,
		private modal: ModalView,
		private events: IEvents
	) {}

	async init() {
		this.state.setCatalog(await this.api.getCatalog());
		this.renderCatalog();

		this.events.on('card:select', ({ id }: { id: string }) =>
			this.openPreview(id)
		);
		this.events.on('basket:add', ({ id }: { id: string }) =>
			this.state.addItem(id)
		);
		this.events.on('basket:remove', ({ id }: { id: string }) =>
			this.state.removeItem(id)
		);
		this.events.on('basket:update', () => {
			this.updateHeaderCounter();
			if (document.querySelector('#modal-container.modal_active .basket')) {
				this.openBasket();
			}
		});

		this.events.on('order:open', () => {
			onceModalClose(this.events, () => this.openOrderStep1());
			this.modal.close();
		});

		document
			.querySelector('.header__basket')
			?.addEventListener('click', () => this.openBasket());

		this.updateHeaderCounter();
	}

	private renderCatalog() {
		const template = document.getElementById(
			'card-catalog'
		) as HTMLTemplateElement;
		this.page.catalog = this.state.catalog.map((p) => {
			const elem = template.content.firstElementChild!.cloneNode(
				true
			) as HTMLElement;
			const card = new ProductCard(elem, {
				onClick: () => this.events.emit('card:select', { id: p.id }),
			});
			Object.assign(card, p);
			return elem;
		});
	}

	private openPreview(id: string) {
		const product = this.state.catalog.find((p) => p.id === id);
		if (!product) return;

		const template = document.getElementById(
			'card-preview'
		) as HTMLTemplateElement;
		const elem = template.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;

		const view = new ProductCard(elem, {
			onClick: () => {
				this.events.emit('basket:add', { id });
				this.modal.close();
			},
		});
		Object.assign(view, {
			...product,
			description: product.description,
		});

		this.modal.open(elem);
	}

	private openBasket() {
		const template = document.getElementById('basket') as HTMLTemplateElement;
		const elem = template.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;
		const basketView = new Basket(elem, this.events);

		const templateBsktCard = document.getElementById(
			'card-basket'
		) as HTMLTemplateElement;

		const rows: HTMLElement[] = [];
		let sum = 0;

		this.state.order.items.forEach((id, index) => {
			const p = this.state.catalog.find((t) => t.id === id);
			if (!p) return;
			sum += p.price;

			const li = templateBsktCard.content.firstElementChild!.cloneNode(
				true
			) as HTMLElement;
			li.querySelector('.basket__item-index')!.textContent = String(index + 1);
			li.querySelector('.card__title')!.textContent = p.title;
			li.querySelector('.card__price')!.textContent =
				p.price != null ? `${p.price} синапсов` : 'Бесценно';

			li.querySelector('.basket__item-delete')!.addEventListener('click', () =>
				this.events.emit('basket:remove', { id })
			);

			rows.push(li);
		});

		basketView.items = rows;
		basketView.total = sum;
		basketView.selected = this.state.order.items;

		this.modal.open(elem);
	}

	private updateHeaderCounter() {
		const span = document.querySelector('.header__basket-counter')!;
		const quantity = this.state.order.items.length;
		span.textContent = String(quantity);
		span.classList.toggle('header__basket-counter_hidden', quantity === 0);
	}

	private openOrderStep1() {
		const elem = (
			document.getElementById('order') as HTMLTemplateElement
		).content.firstElementChild!.cloneNode(true) as HTMLElement;

		const form = elem as HTMLFormElement;
		const address = form.elements.namedItem('address') as HTMLInputElement;
		const next = form.querySelector<HTMLButtonElement>('button[type=submit]')!;

		const payButton = Array.from(
			form.querySelectorAll<HTMLButtonElement>('button[name]')
		);

		let pay: PaymentMethod | null = null;

		payButton.forEach((btn) => {
			btn.addEventListener('click', () => {
				pay = btn.getAttribute('name') as PaymentMethod;
				payButton.forEach((b) =>
					b.classList.toggle('button_alt-active', b === btn)
				);
				toggle();
			});
		});

		const toggle = () => {
			next.disabled = !(address.value.trim() && pay);
		};
		address.addEventListener('input', toggle);
		toggle();

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.state.order.address = (
				form.elements.namedItem('address') as HTMLInputElement
			).value.trim();
			this.state.order.payment = pay as PaymentMethod;

			onceModalClose(this.events, () => this.openOrderStep2());
			this.modal.close();
		});

		this.modal.open(elem);
	}

	private openOrderStep2() {
		const elem = (
			document.getElementById('contacts') as HTMLTemplateElement
		).content.firstElementChild!.cloneNode(true) as HTMLElement;

		const form = elem as HTMLFormElement;

		new Form<IOrderDataStep2>(form, this.events);

		const emailInput = form.elements.namedItem('email') as HTMLInputElement;
		const phoneInput = form.elements.namedItem('phone') as HTMLInputElement;
		const payButton = form.querySelector<HTMLButtonElement>(
			'button[type=submit]'
		)!;

		const toggle = () => {
			const okEmail = emailInput.validity.valid;
			const okPhone = phoneInput.validity.valid;
			payButton.disabled = !(okEmail && okPhone);
		};
		emailInput.addEventListener('input', toggle);
		phoneInput.addEventListener('input', toggle);
		toggle();

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			this.state.order.email = (
				form.elements.namedItem('email') as HTMLInputElement
			).value.trim();
			this.state.order.phone = (
				form.elements.namedItem('phone') as HTMLInputElement
			).value.trim();
			this.state.order.total = this.state.getTotal();

			try {
				const res = await this.api.order(this.state.order);
				this.state.clearBasket();
				this.showSuccess(res);
			} catch (err) {
				alert('Ошибка оформления заказа: ' + err);
			}
		});

		this.modal.open(elem);
	}

	private showSuccess(res: IOrderResponse) {
		const elem = (
			document.getElementById('success') as HTMLTemplateElement
		).content.firstElementChild!.cloneNode(true) as HTMLElement;

		elem.querySelector(
			'.order-success__description'
		)!.textContent = `Списано ${res.total} синапсов`;
		elem.querySelector('.order-success__close')!.setAttribute('data-close', '');

		this.modal.open(elem);
	}
}
