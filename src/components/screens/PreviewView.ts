import { EventEmitter } from '../base/events';
import { IProduct }     from '../../types';
import { ProductCard }  from '../common/ProductCard';

export class PreviewView {
	private template: HTMLTemplateElement;
	private element: HTMLElement;
	private button  : HTMLButtonElement;
	private card    : ProductCard;
    private current : IProduct | null = null; 

	constructor(
		private events: EventEmitter,
	) {
		this.template = document.getElementById('card-preview') as HTMLTemplateElement;
		this.element  = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;

		this.button  = this.element.querySelector<HTMLButtonElement>('.card__button')!;
        this.card    = new ProductCard(this.element);

		this.button.addEventListener('click', () => {
            if (!this.current) return;
            this.events.emit('basket:add', { id: this.current.id });
            this.events.emit('modal:request-close', {});
        });	
	}

	show(product: IProduct, disabled = false): HTMLElement {
		this.current       = product;
        this.card.id       = product.id;
        this.card.title    = product.title;
        this.card.image    = product.image;
        this.card.price    = product.price;
        this.card.category = product.category;
        this.card.description = product.description ?? ''

        this.button.disabled   = disabled;
        this.button.textContent = disabled
            ? (product.price === null ? 'Нет в продаже' : 'Уже в корзине')
            : 'В корзину';

		return this.card.render();
	}
}