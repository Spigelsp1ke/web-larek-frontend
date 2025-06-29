import { EventEmitter } from '../base/events';
import { IOrderDataStep1, PaymentMethod } from '../../types';
import { Form } from '../common/Form';


export class OrderAddressView extends Form<IOrderDataStep1> {
	private template: HTMLTemplateElement;
	private currentPayment: PaymentMethod | null = null;
	private paymentButtons: HTMLButtonElement[];
	private addressInput: HTMLInputElement;

	constructor(private events: EventEmitter) {
        const template = document.getElementById('order') as HTMLTemplateElement;
        const root = template.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
        root.name = 'order-address';

        super(root, events);

        this.template  = template;

		this.paymentButtons = Array.from(
			root.querySelectorAll<HTMLButtonElement>('button[name]')
		);
		this.addressInput = root.elements.namedItem(
			'address'
		) as HTMLInputElement;

		this.setupEventListeners();
	}

    get element(): HTMLElement { return this.container; }

	private setupEventListeners() {
		this.setupPaymentButtons();

		this.setupAddressInput();

		this.setupFormSubmission();
	}

	private setupPaymentButtons() {
		this.paymentButtons.forEach((btn) => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				const payment = btn.getAttribute('name') as PaymentMethod;

				this.currentPayment = payment;

				this.paymentButtons.forEach((b) =>
					b.classList.toggle('button_alt-active', b === btn)
				);

				this.events.emit('order:change', {
					key: 'payment',
					value: payment,
				});
			});
		});
	}

	private setupAddressInput() {
		this.addressInput.addEventListener('input', () => {
			this.events.emit('order:change', {
				key: 'address',
				value: this.addressInput.value,
			});
		});
	}

	private setupFormSubmission() {
		this.container.addEventListener('submit', (e) => {
			e.preventDefault();

			this.events.emit('order:step1:complete');
		});
	}

	public clear() {
        (this.container as HTMLFormElement).reset();
		this.paymentButtons.forEach(btn => btn.classList.remove('button_alt-active'));
		this.currentPayment = null;
		this.events.emit('order:change', { key: 'payment', value: null });
        this.container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach(el => (el.value = ''));
    }
}
