import { NotFoundError } from "./errors";

export class Model {
    [id: string]: unknown;
    _primary: string;
    type: string;
}

export class Persistence<T extends Model> {
    storage: T[];

    constructor() {
        this.storage = new Array<T>();
    }

    save(obj: T): void {
        this.storage.push(obj);
    }

    find(primary: string): Promise<T | NotFoundError> {
        return new Promise((resolve, reject) => {
            const obj = this.storage.find((obj) => obj[obj._primary] == primary);

            if (obj) resolve(obj);
            reject(new NotFoundError(`Object with primary key ${primary} not found.`));
        });
    }

    exists(primary: string): Promise<boolean> {
        return new Promise((resolve) => {
            const obj = this.storage.find((obj) => obj[obj._primary] == primary);
            if (obj) resolve(true);

            resolve(false);
        });
    }

    findAll(): Promise<T[]> {
        return new Promise((resolve, _reject) => {
            resolve(this.storage);
        });
    }

    findBy(field: string, value: string): Promise<T | NotFoundError> {
        return new Promise((resolve, reject) => {
            const obj = this.storage.find((obj) => obj[field] == value);
            if (obj) resolve(obj);
            
            reject(new NotFoundError(`Object with field ${field} and value ${value} not found.`));
        });
    }

    update(primary: string, obj: T): Promise<T | NotFoundError> {
        return new Promise((resolve, reject) => {
            const index = this.storage.findIndex((obj) => obj[obj._primary] == primary);

            if (index > -1) {
                this.storage[index] = obj;
                resolve(obj);
            } 
            reject(new NotFoundError(`Object with primary key ${primary} not found.`));
        });
    }

    delete(primary: string): Promise<T | NotFoundError> {
        return new Promise((resolve, reject) => {
            const index = this.storage.findIndex((obj) => obj[obj._primary] == primary);

            if (index > -1) {
                const obj = this.storage[index];
                this.storage.splice(index, 1);
                resolve(obj);
            } 
                
            reject(new NotFoundError(`Object with primary key ${primary} not found.`));
        });
    }
}

export function Primary() {
    return function (target: any, propertyKey: string) {
        target._primary = propertyKey;
    };
}