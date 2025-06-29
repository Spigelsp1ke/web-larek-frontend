import { Component } from "../base/Component";
import { EventEmitter } from "../base/events";

export interface IValidation {
    valid: boolean;
    errors: string[];
}

export abstract class Form<T> extends Component<IValidation>  {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected form: HTMLFormElement, events: EventEmitter) {
        super(form);

        this._submit = form.querySelector('button[type=submit]');
        this._errors = form.querySelector('.form__errors');

		form.addEventListener('input', (e) => {
			const t = e.target as HTMLInputElement;
			events.emit(`order:change`, { key: t.name, value: t.value });
		});

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			events.emit(`${form.name}:submit`);
		});
    }

    updateValidation({ valid, errors }: IValidation) {
        this._submit.disabled = !valid;
        this._errors.textContent = errors.join('; ');
    }
}