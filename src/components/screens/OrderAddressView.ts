import { EventEmitter } from '../base/events';
import { ModalView }    from '../common/Modal';
import { ShopState }    from '../AppData';
import { PaymentMethod } from '../../types';

export class OrderAddressView {
	private template: HTMLTemplateElement;

	constructor(
		private modal: ModalView,
		private events: EventEmitter,
		private state: ShopState,
	) {
		this.template = document.getElementById('order') as HTMLTemplateElement;
	}

	show() {
		const node   = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		const form   = node as HTMLFormElement;
		const addr   = form.elements.namedItem('address') as HTMLInputElement;
		const next   = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
		const payBtn = Array.from(form.querySelectorAll<HTMLButtonElement>('button[name]'));

		let payment: PaymentMethod | null = null;

		payBtn.forEach(btn => btn.addEventListener('click', () => {
			payment = btn.getAttribute('name') as PaymentMethod;
			payBtn.forEach(b => b.classList.toggle('button_alt-active', b === btn));
			validate();
		}));

		const validate = () => next.disabled = !(addr.value.trim() && payment);
		addr.addEventListener('input', validate);
		validate();

		form.addEventListener('submit', e => {
			e.preventDefault();
			this.events.emit('order:step1:complete', {
				address: addr.value.trim(),
				payment: payment as PaymentMethod,
			});
		});

		this.modal.open(node);
	}
}
