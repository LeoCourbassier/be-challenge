import OrganizationController from '../controllers/organization.controller';
import { Router } from 'express';
import { Persistence } from 'repository';
import Organization from 'models/organization.model';

export default class OrganizationRouter {
    private router: Router;
    private organizationController: OrganizationController;
 
    constructor(repo: Persistence<Organization>) {
        this.router = Router();
        this.organizationController = new OrganizationController(repo);
        this.initializeRoutes();
    }
 
    private initializeRoutes() {
        this.router.get("/", this.organizationController.getOrganizations);
        this.router.get("/:id", this.organizationController.getOrganization);
        this.router.post("/", this.organizationController.createOrganization);
    }
 
    getRouter(): Router {
        return this.router;
    }
}