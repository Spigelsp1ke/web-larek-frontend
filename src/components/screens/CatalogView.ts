import { EventEmitter } from '../base/events';
import { Page }         from '../common/Page';
import { IProduct } from '../../types';
import { ProductCard }  from '../ProductCard';

export class CatalogView {
	private template: HTMLTemplateElement;

	constructor(
		private page: Page,
		private events: EventEmitter,
	) {
		this.template = document.getElementById('card-catalog') as HTMLTemplateElement;

		this.events.on<{ catalog: IProduct[] }>('ui:catalog', ({ catalog }) => {
      this.render(catalog);
      });
	}

	private render(products: IProduct[]) {

    if (!products || products.length === 0) {
			return;
		}

		const cards = products.map((product) => {
      if (!this.template || !this.template.content) {
				return null;
			}

			const node  = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;

			const card  = new ProductCard(node, {
			  onClick: () => this.events.emit('card:select', { id: product.id }),
			});
			Object.assign(card, product);
			return node;
		});
		this.page.catalog = cards;
	}
}
