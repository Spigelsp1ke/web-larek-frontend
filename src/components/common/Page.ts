import {Component} from "../base/Component";
import {EventEmitter} from "../base/events";
import {ensureElement} from "../../utils/utils";

interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export class Page extends Component<IPage> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLElement;


    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._counter = this.container.querySelector('.header__basket-counter');
        this._catalog = this.container.querySelector('.gallery');
        this._wrapper = this.container.querySelector('.page__wrapper');
        this._basket = this.container.querySelector('.header__basket');

        this._basket.addEventListener('click', (e) => {
            e.preventDefault();
            this.events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this.setText(this._counter, String(value));
    }

    set catalog(items: HTMLElement[]) {
        this._catalog.replaceChildren(...items);
    }

    set locked(value: boolean) {
        if (value) {
            this._wrapper.classList.add('page__wrapper_locked');
        } else {
            this._wrapper.classList.remove('page__wrapper_locked');
        }
    }
}