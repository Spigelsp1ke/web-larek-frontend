import { EventEmitter } from '../base/events';
import { PaymentMethod } from '../../types';


export class OrderAddressView {
	private template: HTMLTemplateElement;
	private container: HTMLElement;
	private currentPayment: PaymentMethod | null = null;
	public formElement: HTMLFormElement;
	private paymentButtons: HTMLButtonElement[];
	private addressInput: HTMLInputElement;

	constructor(private events: EventEmitter) {
		this.template = document.getElementById('order') as HTMLTemplateElement;
		this.container = this.template.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;
		this.formElement = this.container as HTMLFormElement;
		this.formElement.name = 'order-address';

		this.paymentButtons = Array.from(
			this.formElement.querySelectorAll<HTMLButtonElement>('button[name]')
		);
		this.addressInput = this.formElement.elements.namedItem(
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

				this.paymentButtons.forEach((b) =>
					b.classList.toggle('button_alt-active', b === btn)
				);

				this.currentPayment = payment;
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
		this.formElement.addEventListener('submit', (e) => {
			e.preventDefault();

			this.events.emit('order:step1:complete', {
				address: this.addressInput.value.trim(),
				payment: this.currentPayment,
			});
		});
	}

	public clear() {
        this.formElement.reset();
		this.formElement.querySelectorAll<HTMLButtonElement>('button[name]').forEach(btn => btn.classList.remove('button_alt-active'));
        this.formElement.querySelectorAll('input, textarea').forEach(el => (el.textContent = ''));
    }
}
