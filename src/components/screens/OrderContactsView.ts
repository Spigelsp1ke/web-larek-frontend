import { EventEmitter } from '../base/events';
import { ModalView }    from '../common/Modal';
import { Form }         from '../common/Form';
import { ShopState }    from '../AppData';
import { IOrderDataStep2 } from '../../types';

export class OrderContactsView {
	private template: HTMLTemplateElement;

	constructor(
		private modal: ModalView,
		private events: EventEmitter,
		private state: ShopState,
	) {
		this.template = document.getElementById('contacts') as HTMLTemplateElement;
  }

	show() {
		const node = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		const form = node as HTMLFormElement;
    const phone   = form.elements.namedItem('phone') as HTMLInputElement;
		const email   = form.elements.namedItem('email') as HTMLInputElement;
		const next   = form.querySelector<HTMLButtonElement>('button[type=submit]')!;

		new Form<IOrderDataStep2>(form, this.events);

    const validate = () => next.disabled = !(phone.value.trim() && email.value.trim());
    phone.addEventListener('input', validate);
    email.addEventListener('input', validate);
    validate();

		form.addEventListener('submit', e => {
			e.preventDefault();
			this.events.emit('order:complete', {
				email: (form.elements.namedItem('email')  as HTMLInputElement).value.trim(),
				phone: (form.elements.namedItem('phone')  as HTMLInputElement).value.trim(),
			});
			this.modal.close();
		});

		this.modal.open(node);
	}
}
