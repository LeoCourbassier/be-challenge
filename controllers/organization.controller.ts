import status from "http-status";
import Organization from "../models/organization.model";
import { Request, Response } from "express";
import { Logger } from "../logger";
import { Persistence } from "../repository";
import { NotFoundError, ValidationError } from "../errors";

export default class OrganizationController {
    repo: Persistence<Organization>;

    constructor(r: Persistence<Organization>) {
        this.getOrganizations = this.getOrganizations.bind(this);
        this.getOrganization = this.getOrganization.bind(this);
        this.createOrganization = this.createOrganization.bind(this);

        this.repo = r;
    }

    @Logger()
    async getOrganizations(_req: Request, res: Response) {
        try {
            const organizations = await this.repo.findAll();
            res.status(status.OK).json(organizations);
        }
        catch (err) {
            res.status(status.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    @Logger()
    async getOrganization(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                throw new ValidationError("ID is required");
            }

            const organization = await this.repo.find(req.params.id);
            res.status(status.OK).json(organization);
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
    async createOrganization(req: Request, res: Response) {
        try {
            const organization = Organization.fromJson(req.body);
            
            if (await this.repo.exists(organization.id)) {
                await this.repo.update(organization.id, organization);
                return res.status(status.OK).json(organization);
            }

            await this.repo.save(organization);
            res.status(status.CREATED).json(organization);
        }
        catch (err) {
            if (err instanceof ValidationError)
                res.status(status.BAD_REQUEST).json({ message: err.message });
            else
                res.status(status.INTERNAL_SERVER_ERROR).json(err);
            throw err;
        }
    }
}