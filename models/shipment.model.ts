import { ValidationError } from "../errors";
import { Model, Primary } from "../repository";
import Organization from "./organization.model";

type UNIT_KILOGRAMS = "KILOGRAMS";
type UNIT_POUNDS = "POUNDS";
type UNIT_OUNCES = "OUNCES";

export const Unit = {
    KILOGRAMS: "KILOGRAMS" as UNIT_KILOGRAMS,
    POUNDS: "POUNDS" as UNIT_POUNDS,
    OUNCES: "OUNCES" as UNIT_OUNCES
};

export class Weight {
    weight: number;
    unit: UNIT_KILOGRAMS | UNIT_POUNDS | UNIT_OUNCES;

    constructor(weight: number, unit: UNIT_KILOGRAMS | UNIT_POUNDS | UNIT_OUNCES) {
        this.weight = weight;
        this.unit = unit;
    }

    toKilograms(): number {
        switch (this.unit) {
            case Unit.KILOGRAMS:
                return this.weight;
            case Unit.POUNDS:
                return this.weight * 0.453592;
            case Unit.OUNCES:
                return this.weight * 0.0283495;
        }
    }

    toPounds(): number {
        switch (this.unit) {
            case Unit.KILOGRAMS:
                return this.weight * 2.20462;
            case Unit.POUNDS:
                return this.weight;
            case Unit.OUNCES:
                return this.weight * 0.0625;
        }
    }

    toOunces(): number {
        switch (this.unit) {
            case Unit.KILOGRAMS:
                return this.weight * 35.274;
            case Unit.POUNDS:
                return this.weight * 16;
            case Unit.OUNCES:
                return this.weight;
        }
    }
}

class TransportPack {
    totalWeight: Weight;

    constructor(totalWeight: Weight) {
        this.totalWeight = totalWeight;
    }
}

class TransportPacks {
    nodes: TransportPack[];

    constructor(nodes: TransportPack[]) {
        this.nodes = nodes;
    }

    totalWeightKG(): Weight {
        const totalWeight = this.nodes.reduce((acc, node) => acc + Number(node.totalWeight.toKilograms()), 0);
        return new Weight(totalWeight, Unit.KILOGRAMS);
    }

    totalWeightLB(): Weight {
        const totalWeight = this.nodes.reduce((acc, node) => acc + Number(node.totalWeight.toPounds()), 0);
        return new Weight(totalWeight, Unit.POUNDS);
    }

    totalWeightOZ(): Weight {
        const totalWeight = this.nodes.reduce((acc, node) => acc + Number(node.totalWeight.toOunces()), 0);
        return new Weight(totalWeight, Unit.OUNCES);
    }

    static fromJson(json: any): TransportPacks {
        if (!json || !json.nodes) {
            throw new ValidationError("Invalid JSON");
        }
        
        return new TransportPacks(json.nodes.map((node: any) => new TransportPack(new Weight(node.totalWeight.weight, node.totalWeight.unit))));
    }
}

export default class Shipment extends Model {
    @Primary()
    referenceId: string;
    organizations: Organization[];
    estimatedTimeArrival: string;
    transportPacks: TransportPacks;

    constructor(referenceId: string, orgs: Organization[], estimatedTimeArrival: string, transportPacks: TransportPacks) {
        super();
        this.referenceId = referenceId;
        this.organizations = orgs;
        this.estimatedTimeArrival = estimatedTimeArrival;
        this.transportPacks = transportPacks;
        this.type = "SHIPMENT";
    }

    static fromJson(json: any): Shipment {
        if (!json.referenceId || !json.transportPacks) {
            throw new ValidationError("Invalid JSON");
        }
        
        return new Shipment(json.referenceId, Organization.fromJsonArray(json.organizations), json.estimatedTimeArrival, TransportPacks.fromJson(json.transportPacks));
    }

    static fromJsonArray(json: any): Shipment[] {
        return json.map((shipment: any) => Shipment.fromJson(shipment));
    }
}

