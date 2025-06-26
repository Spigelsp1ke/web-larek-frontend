import { EventEmitter }   from '../base/events';


export abstract class Model<T> {
    constructor(data: Partial<T>, protected events: EventEmitter) {
        Object.assign(this, data);
    }

    emit(event: string, payload?: object) {
        this.events.emit(event, payload ?? {});
    }
}