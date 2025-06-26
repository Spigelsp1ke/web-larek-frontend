import { EventEmitter } from '../base/events';
import { IOrder, PaymentMethod } from '../../types';
import { Form } from '../common/Form';

export class OrderAddressView {
	private template: HTMLTemplateElement;
	private form?: Form<IOrder>;
	private currentPayment: PaymentMethod | null = null;
	protected container: HTMLElement;
	private formElement: HTMLFormElement;
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

		this.events.on(
			'order:step1:validated',
			(result: { valid: boolean; errors: string[] }) => {
				this.updateFormValidation(result);
			}
		);
	}

	show(): HTMLElement {
		this.form = new Form<IOrder>(this.formElement, this.events);
		return this.container;
	}

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

	private updateFormValidation(result: { valid: boolean; errors: string[] }) {
        this.form?.render(result);
	}
}
