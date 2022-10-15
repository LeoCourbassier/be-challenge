import { Request, Response, Router } from "express";
import httpStatus from "http-status";
import Shipment from "./models/shipment.model";
import { Persistence } from "./repository";
import OrganizationRouter from "./routes/organizations.route";
import ShipmentRouter from "./routes/shipments.route";
import Organization from "./models/organization.model";

const router = Router();

const shipmentRepo = new Persistence<Shipment>();
const organizationRepo = new Persistence<Organization>();

const shipmentRouter = new ShipmentRouter(shipmentRepo, organizationRepo);
const organizationRouter = new OrganizationRouter(organizationRepo);

router.use('/organizations', organizationRouter.getRouter());
router.use('/shipments', shipmentRouter.getRouter());

router.get('/', (_req: Request, res: Response) => {
    res.status(httpStatus.OK).json('Running :)');
});

export default router;