export class NotFoundError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ValidationError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}