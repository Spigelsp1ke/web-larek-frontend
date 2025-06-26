import { EventEmitter } from '../base/events';
import { IProduct } from '../../types';
import { ProductCard }  from '../common/ProductCard';

interface IProductCardFactory {
	create: (container: HTMLElement, product: IProduct) => ProductCard;
}

class ProductCardFactory implements IProductCardFactory {
	constructor(private events: EventEmitter) {}

	create(container: HTMLElement, product: IProduct): ProductCard {
		const card = new ProductCard(container, {
			onClick: () => this.events.emit('card:select', { id: product.id }),
		});

		card.id = product.id;
		card.title = product.title;
		card.image = product.image;
		card.category = product.category;
		card.price = product.price;
		if (product.description) card.description = product.description;

		return card;
	}
}

export class CatalogView {
	private template: HTMLTemplateElement;
	private container: HTMLElement;
	private cardFactory: IProductCardFactory;

	constructor(private events: EventEmitter, 
		cardFactory?: IProductCardFactory
	) {
		this.template = document.getElementById(
			'card-catalog'
		) as HTMLTemplateElement;
		this.container = document.querySelector('.gallery') as HTMLElement;

        this.cardFactory = cardFactory || new ProductCardFactory(events);
	}

	render(products: IProduct[]) {
		if (!this.container || !this.template) {
			return;
		}

		const cards: HTMLElement[] = [];

		for(const product of products) {
			const node = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;

            const card = this.cardFactory.create(node, product);
			cards.push(card.render());
		};

		this.container.replaceChildren(...cards);
	}
}
