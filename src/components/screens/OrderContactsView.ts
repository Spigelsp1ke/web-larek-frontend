import { EventEmitter } from '../base/events';
import { Form } from '../common/Form';
import { IOrder, IOrderDataStep2 } from '../../types';

export class OrderContactsView {
	private template: HTMLTemplateElement;
	private form?: Form<IOrderDataStep2>;
	protected container: HTMLElement;
	private formElement: HTMLFormElement;
	private phoneInput: HTMLInputElement;
	private emailInput: HTMLInputElement;

	constructor(private events: EventEmitter) {
		this.template = document.getElementById('contacts') as HTMLTemplateElement;
		this.container = this.template.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;
		this.formElement = this.container as HTMLFormElement;
		this.formElement.name = 'order-contacts';

		this.phoneInput = this.formElement.elements.namedItem(
			'phone'
		) as HTMLInputElement;
		this.emailInput = this.formElement.elements.namedItem(
			'email'
		) as HTMLInputElement;

		this.setupEventListeners();

		this.events.on(
			'order:step2:validated',
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
		this.setupInputHandlers();

		this.setupFormSubmission();
	}

	private setupInputHandlers() {
		this.phoneInput.addEventListener('input', () => {
			this.events.emit('order:change', {
				key: 'phone',
				value: this.phoneInput.value,
			});
		});

		this.emailInput.addEventListener('input', () => {
			this.events.emit('order:change', {
				key: 'email',
				value: this.emailInput.value,
			});
		});
	}

	private setupFormSubmission() {
		this.formElement.addEventListener('submit', (e) => {
			e.preventDefault();

			this.events.emit('order:complete', {
				email: this.emailInput.value.trim(),
				phone: this.phoneInput.value.trim(),
			});

			this.events.emit('modal:close');
		});
	}

	private updateFormValidation(result: { valid: boolean; errors: string[] }) {
        this.form?.render(result);
	}
}
