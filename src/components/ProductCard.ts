import { Component } from './base/Component';
import { ensureElement } from './../utils/utils';
import { IProduct } from './../types';

interface ICardActions {
	onClick: (e: MouseEvent) => void;
}

export class ProductCard extends Component<IProduct> {
	private _title: HTMLElement;
	private _image: HTMLImageElement;
	private _category: HTMLElement;
	private _price: HTMLElement;
	private _description?: HTMLElement;
	private _button?: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement('.card__title', container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._category = ensureElement('.card__category', container);
		this._price = ensureElement('.card__price', container);
		this._description = container.querySelector('.card__text') ?? undefined;
		this._button = container.querySelector('.card__button');

		const target = this._button ?? container;
		if (actions?.onClick) target.addEventListener('click', actions.onClick);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}
	get id() {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}
	get title() {
		return this._title.textContent ?? '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		this.setText(this._category, value);
		const category = value.toLowerCase().includes('софт')
			? 'soft'
			: value.toLowerCase().includes('хард')
			? 'hard'
			: value.toLowerCase().includes('дополнительное')
			? 'additional'
			: value.toLowerCase().includes('кнопка')
			? 'button'
			: 'other';
		this._category.className = `card__category card__category_${category}`;
	}

	set price(value: number) {
		this.setText(this._price, `${value} синапсов`);
		if (value === null) {
			this.setText(this._price, `Бесценно`);
		}
	}

	set description(value: string) {
		if (this._description) this.setText(this._description, value);
	}
}
