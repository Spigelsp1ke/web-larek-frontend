import {Component} from "../base/Component";
import { EventEmitter } from "../base/events";

interface IFormState {
    valid: boolean;
    errors: string[];
}

export class Form<T> extends Component<IFormState> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: EventEmitter) {
        super(container);

        this._submit = this.container.querySelector('button[type=submit]');
        this._errors = this.container.querySelector('.form__errors');

        this.container.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', (e: Event) => {
                const target = e.target as HTMLInputElement;
                this.events.emit('order:change', {
                    key: target.name,
                    value: target.value
                });
            });
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });

        this.events.on('order:validated', (data: { valid: boolean; errors: string[] }) => {
            this.updateValidation(data);
        });
    }

    private updateValidation(data: { valid: boolean; errors: string[] }) {
        this.valid = data.valid;
        this.errors = data.errors;
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
    }

    set errors(value: string | string[]) {
        if (this._errors) {
            const errorText = Array.isArray(value) ? value.join('; ') : value;
            this.setText(this._errors, errorText);
        }
    }

    render(state: Partial<T> & IFormState) {
        const {valid, errors, ...inputs} = state;
        super.render({valid, errors});
        Object.assign(this, inputs);
        return this.container;
    }
}