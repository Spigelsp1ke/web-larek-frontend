import { IOrderDataStep2 } from '../../types';
import { EventEmitter } from '../base/events';
import { Form } from '../common/Form';

export class OrderContactsView extends Form<IOrderDataStep2> {
	private template: HTMLTemplateElement;
	private phoneInput: HTMLInputElement;
	private emailInput: HTMLInputElement;


	constructor(private events: EventEmitter) {
		const template = document.getElementById('contacts') as HTMLTemplateElement;
		const root = template.content.firstElementChild!.cloneNode(
			true
		) as HTMLFormElement;
		root.name = 'order-contacts';

		super(root, events);

		this.template = template

		this.phoneInput = root.elements.namedItem(
			'phone'
		) as HTMLInputElement;
		this.emailInput = root.elements.namedItem(
			'email'
		) as HTMLInputElement;

		this.setupEventListeners();
	}

    get element(): HTMLElement { return this.container; }

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
		this.container.addEventListener('submit', (e) => {
			e.preventDefault();

			if (!(this.container as HTMLFormElement).checkValidity()) {
				this.updateValidation({ valid: false, errors: [] });
				return;
			}

			this.events.emit('order:complete', {
				email: this.emailInput.value.trim(),
				phone: this.phoneInput.value.trim(),
			});

			this.events.emit('modal:close');
		});
	}

	public clear() {
        (this.container as HTMLFormElement).reset();
        (this.container as HTMLFormElement).querySelectorAll('input, textarea').forEach(el => ((el as HTMLInputElement | HTMLTextAreaElement).value = ''));
    }
}
