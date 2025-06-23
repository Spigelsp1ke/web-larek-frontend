import { EventEmitter }  from '../base/events';
import { ModalView }     from '../common/Modal';
import { IOrderResponse } from '../../types';

export class SuccessView {
	private template: HTMLTemplateElement;

	constructor(
		private modal: ModalView,
		_   : EventEmitter,
	) {
		this.template = document.getElementById('success') as HTMLTemplateElement;
	}

	show(res: IOrderResponse) {
		const node = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		node.querySelector('.order-success__description')!
			.textContent = `Списано ${res.total} синапсов`;
		node.querySelector('.order-success__close')!
			.setAttribute('data-close', '');
		this.modal.open(node);
	}
}
