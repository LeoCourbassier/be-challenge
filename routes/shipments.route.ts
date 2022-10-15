import ShipmentController from '../controllers/shipment.controller';
import { Router } from 'express';
import Organization from 'models/organization.model';
import Shipment from 'models/shipment.model';
import { Persistence } from 'repository';

export default class ShipmentRouter {
    private router: Router;
    private shipmentController: ShipmentController;
 
    constructor(shipmentRepo: Persistence<Shipment>, organizationRepo: Persistence<Organization>) {
        this.router = Router();
        this.shipmentController = new ShipmentController(shipmentRepo, organizationRepo);
        this.initializeRoutes();
    }
 
    private initializeRoutes() {
        this.router.get("/", this.shipmentController.getShipments);
        this.router.get("/:referenceId", this.shipmentController.getShipment);
        this.router.post("/", this.shipmentController.createShipment);
        this.router.get("/aggregate/weight/:unit", this.shipmentController.getWeightAggregates);
    }
 
    getRouter(): Router {
        return this.router;
    }
}