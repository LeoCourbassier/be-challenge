import Shipment, { Unit } from "../models/shipment.model";
import { Persistence } from "../repository";
import status from "http-status";
import { Logger } from "../logger";
import { Request, Response } from "express";
import { NotFoundError, ValidationError } from "../errors";
import Organization from "../models/organization.model";

export default class ShipmentController {
    shipmentRepo: Persistence<Shipment>;
    organizationRepo: Persistence<Organization>;

    constructor(shipmentRepo: Persistence<Shipment>, organizationRepo: Persistence<Organization>) {
        this.getShipments = this.getShipments.bind(this);
        this.getShipment = this.getShipment.bind(this);
        this.createShipment = this.createShipment.bind(this);
        this.getWeightAggregates = this.getWeightAggregates.bind(this);

        this.shipmentRepo = shipmentRepo;
        this.organizationRepo = organizationRepo;
    }

    @Logger()
    async getShipments(_req: Request, res: Response) {
        try {
            const shipments = await this.shipmentRepo.findAll();

            res.status(status.OK).json(shipments);
        }
        catch (err) {
            res.status(status.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    @Logger()
    async getShipment(req: Request, res: Response) {
        try {
            if (!req.params.referenceId) {
                throw new ValidationError("Reference ID is required");
            }

            const shipment = await this.shipmentRepo.find(req.params.referenceId);
            res.status(status.OK).json(shipment);
        }
        catch (err) {
            if (err instanceof NotFoundError) 
                res.status(status.NOT_FOUND).json({ message: err.message });
            else if (err instanceof ValidationError)
                res.status(status.BAD_REQUEST).json({ message: err.message });
            else 
                res.status(status.INTERNAL_SERVER_ERROR).json(err);
            throw err;
        }
    }

    @Logger()
    async createShipment(req: Request, res: Response) {
        try {
            const shipment = Shipment.fromJson(req.body);
            this.applyOrganization(shipment);
            
            if (await this.shipmentRepo.exists(shipment.referenceId)) {
                const updatedShipment = await this.shipmentRepo.update(shipment.referenceId, shipment);
                return res.status(status.OK).json(updatedShipment);
            }

            await this.shipmentRepo.save(shipment);
            res.status(status.CREATED).json(shipment);
        }
        catch (err) {
            if (err instanceof ValidationError)
                res.status(status.BAD_REQUEST).json({ message: err.message });
            else
                res.status(status.INTERNAL_SERVER_ERROR).json(err);
            throw err;
        }
    }

    @Logger()
    async getWeightAggregates(req: Request, res: Response) {
        try {
            if (!req.params.unit || !(req.params.unit in Unit)) {
                throw new ValidationError("Unit is required");
            }

            const shipments = await this.shipmentRepo.findAll();
            const aggregates = shipments.reduce((acc: number, shipment: Shipment) => {
                if (req.params.unit === Unit.KILOGRAMS) {
                    return acc + Number(shipment.transportPacks.totalWeightKG().weight);
                }
                
                if (req.params.unit === Unit.POUNDS) {
                    return acc + Number(shipment.transportPacks.totalWeightLB().weight);
                }
                
                if (req.params.unit === Unit.OUNCES) {
                    return acc + Number(shipment.transportPacks.totalWeightOZ().weight);
                }
            }, 0);

            res.status(status.OK).json({ totalWeight: aggregates?.toFixed(2), unit: req.params.unit });
        }
        catch (err) {
            if (err instanceof ValidationError)
                res.status(status.BAD_REQUEST).json({ message: err.message });
            else
                res.status(status.INTERNAL_SERVER_ERROR).json(err);
            throw err;
        }
    }

    private async applyOrganization(shipment: Shipment) {
        const organizations = await this.organizationRepo.findAll();
        
        shipment.organizations = shipment.organizations.map(org => {
            const organization = organizations.find(o => o.code == org.code);
            if (organization) {
                return organization;
            }
            return org;
        });
    }
}
