import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { PaymentMethod } from '../../types';

export class PaymentSelector extends Component<{ value: PaymentMethod | null }> {
  private buttons: HTMLButtonElement[];
  private _value: PaymentMethod | null = null;
  constructor(root: HTMLElement, private events: IEvents) {
    super(root);
    this.buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button[name]'));
    this.buttons.forEach((btn) =>
      btn.addEventListener('click', () => {
        this._value = btn.getAttribute('name') as PaymentMethod;
        this.buttons.forEach((b) => this.toggleClass(b, 'button_alt-active', b === btn));
        this.events.emit('payment:change', { value: this._value });
      }),
    );
  }
  get value() {
    return this._value;
  }
}