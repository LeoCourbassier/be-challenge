import { ValidationError } from "../errors";
import { Model, Primary } from "../repository";

export default class Organization extends Model {
    @Primary()
    id: string;
    code: string;

    constructor(id: string, code: string) {
        super();
        this.id = id;
        this.code = code;
        this.type = "ORGANIZATION";
    }

    static fromJsonArray(json: any): Organization[] {
        return json.map((org: any) => Organization.fromJson(org));
    }
    
    static fromJson(json: any): Organization {
        if (!json.code && Object.keys(json).length === 0) {
            throw new ValidationError("Invalid JSON");
        }

        return new Organization(json.id, json.code ? json.code : json);
    }
}