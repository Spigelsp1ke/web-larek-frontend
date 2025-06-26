import { IOrderResponse } from '../../types';

export class SuccessView {
	private element: HTMLElement;
	private description: HTMLElement;
	private closeButton: HTMLElement;
	private template: HTMLTemplateElement;

	constructor() {
		this.template = document.getElementById('success') as HTMLTemplateElement;
		this.element = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		this.description = this.element.querySelector('.order-success__description')!;
		this.closeButton = this.element.querySelector('.order-success__close')!;
		this.closeButton.setAttribute('data-close', '');
	}

	show(res: IOrderResponse): HTMLElement {
        this.description.textContent = `Списано ${res.total} синапсов`;
		return this.element
	}
}
