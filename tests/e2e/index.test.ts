import server from "../../index";
import axios from "axios";
import { messages } from "../../messages";
import { shipmentsMock } from "./__mocks__/shipments";
import { organizationsMock } from "./__mocks__/organizations";
import Shipment from "../../models/shipment.model";
import Organization from "../../models/organization.model";

const shipments = Shipment.fromJsonArray(shipmentsMock);
const organizations = Organization.fromJsonArray(organizationsMock);
const serverUrl = "http://localhost:3000";

afterAll(async () => {
    server.close();
});

beforeAll(async () => {
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        let endpoint = 'shipments'
        if (message.type === 'ORGANIZATION') {
            endpoint = 'organizations'
        }

        await axios.post(`${serverUrl}/${endpoint}`, message)
    }
});

describe('All server routes', () => {
    describe('GET /', () => {
        it('should return 200 & having message "Running :)"', done => {
            axios.get(`${serverUrl}`)
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.data).toBe('Running :)');
                done();
            })
            .catch(error => {
                done(error);
            });
        });
    });

    describe('Shipments routes', () => {
        describe('GET /shipments', () => {
            it('should return 200 & have all data in messages.ts', done => {
                axios.get(`${serverUrl}/shipments`)
                .then(response => {
                    expect(response.status).toBe(200);
                    const resShipments = Shipment.fromJsonArray(response.data);
    
                    shipments.map((shipment, index) => {
                        const resShipment = resShipments.find((resShipment, resIndex) => shipment.referenceId === resShipment.referenceId);
                        expect(shipment).toEqual(resShipment);
                    });
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });
        });
    
        describe('GET /shipments/:id', () => {
            const shipment = shipments[0];
            it(`should return 200 & have shipment with id ${shipment.referenceId}`, done => {
                axios.get(`${serverUrl}/shipments/${shipment.referenceId}`)
                .then(response => {
                    const resShipment = Shipment.fromJson(response.data);
    
                    expect(response.status).toBe(200);
                    expect(resShipment.referenceId).toBe(shipment.referenceId);
                    expect(resShipment).toEqual(shipment);
    
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });

            it(`should return 404 & have message "Shipment with id NOT_A_VALID_ID not found"`, done => {
                axios.get(`${serverUrl}/shipments/NOT_A_VALID_ID`)
                .then(response => {
                    done();
                })
                .catch(error => {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data).toEqual({"message": "Object with primary key NOT_A_VALID_ID not found."});
                    done();
                });
            });
        });
    
        describe('GET /aggregate/weight/:unit', () => {
            it('should return 200 & have total weight in KILOGRAMS', done => {
                axios.get(`${serverUrl}/shipments/aggregate/weight/KILOGRAMS`)
                .then(response => {
                    expect(response.status).toBe(200);
                    expect(response.data.totalWeight).toBe("22730.89");
                    expect(response.data.unit).toBe("KILOGRAMS");
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });
    
            it('should return 200 & have total weight in OUNCES', done => {
                axios.get(`${serverUrl}/shipments/aggregate/weight/OUNCES`)
                .then(response => {
                    expect(response.status).toBe(200);
                    expect(response.data.totalWeight).toBe("801809.25");
                    expect(response.data.unit).toBe("OUNCES");
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });
    
            it('should return 200 & have total weight in POUNDS', done => {
                axios.get(`${serverUrl}/shipments/aggregate/weight/POUNDS`)
                .then(response => {
                    expect(response.status).toBe(200);
                    expect(response.data.totalWeight).toBe("50112.96");
                    expect(response.data.unit).toBe("POUNDS");
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });

            it('should return 400 & have validation error if unit is something else', done => {
                axios.get(`${serverUrl}/shipments/aggregate/weight/METERS`)
                .then(response => {
                    fail();
                })
                .catch(error => {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data).toEqual({"message": "Unit is required"});
                    done();
                });
            });
        });
    
        describe('POST /shipments', () => {
            it('should return 201 & create a new shipment', done => {
                const shipment = shipments[0];
                const lastOrgs = shipment.organizations
                shipment.organizations = Organization.fromJsonArray([ "ORGANIZATION_1", "ORGANIZATION_2" ]);
    
                axios.post(`${serverUrl}/shipments`, shipment)
                .then(response => {
                    const resShipment = Shipment.fromJson(response.data);
    
                    expect(response.status).toBe(200);
                    expect(resShipment.organizations).toEqual(shipment.organizations);
                    expect(resShipment.organizations).not.toEqual(lastOrgs);
                    expect(resShipment).toEqual(shipment);
    
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });

            it('should return 201 & create a new shipment', done => {
                const shipment = shipments[0];
                shipment.referenceId = "SHIPMENT_4";
    
                axios.post(`${serverUrl}/shipments`, shipment)
                .then(response => {
                    const resShipment = Shipment.fromJson(response.data);
    
                    expect(response.status).toBe(201);
                    expect(resShipment.referenceId).toEqual("SHIPMENT_4");
                    expect(resShipment).toEqual(shipment);
    
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });

            it('should return 400 & return error "Invalid JSON"', done => {
                const ship = {};
    
                axios.post(`${serverUrl}/shipments`, ship)
                .then(response => {
                    fail();
                })
                .catch(error => {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data).toEqual({"message": "Invalid JSON"});
                    done();
                });
            });
        });
    });

    describe('Organizations routes', () => {
        describe('GET /organizations', () => {
            it('should return 200 & have all data in messages.ts', done => {
                axios.get(`${serverUrl}/organizations`)
                .then(response => {
                    expect(response.status).toBe(200);
                    const resOrganizations = Organization.fromJsonArray(response.data);
    
                    organizations.map((org, index) => {
                        const resOrg = resOrganizations.find((resOrg, resIndex) => org.id === resOrg.id);
                        
                        expect(org).toEqual(resOrg);
                    });
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });
        });
    
        describe('GET /organizations/:id', () => {
            const org = organizations[0];
            it(`should return 200 & have organization with id ${org.id}`, done => {
                axios.get(`${serverUrl}/organizations/${org.id}`)
                .then(response => {
                    const resOrg = Organization.fromJson(response.data);
    
                    expect(response.status).toBe(200);
                    expect(resOrg.id).toBe(org.id);
                    expect(resOrg).toEqual(org);
    
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });

            it(`should return 404 & have message "Organization with id NOT_A_VALID_ID not found"`, done => {
                axios.get(`${serverUrl}/organizations/NOT_A_VALID_ID`)
                .then(response => {
                    fail();
                })
                .catch(error => {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data).toEqual({"message": "Object with primary key NOT_A_VALID_ID not found."});
                    done();
                });
            });
        });

        describe('POST /organizations', () => {
            it('should return 201 & create a new organization', done => {
                const org = organizations[0];
                org.id = "34f195b5-2aa1-4914-85ab-f8849f9b541b";
    
                axios.post(`${serverUrl}/organizations`, org)
                .then(response => {
                    const resOrg = Organization.fromJson(response.data);
    
                    expect(response.status).toBe(201);
                    expect(resOrg.id).toBe(org.id);
                    expect(resOrg).toEqual(organizations.find(org => org.id === org.id));
    
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });

            it('should return 200 & update an organization instead of creating', done => {
                const org = organizations[0];
                const lastCode = org.code;
                org.code = "ABC";
    
                axios.post(`${serverUrl}/organizations`, org)
                .then(response => {
                    const resOrg = Organization.fromJson(response.data);
    
                    expect(response.status).toBe(200);
                    expect(resOrg.code).toBe(org.code);
                    expect(resOrg.code).not.toBe(lastCode);
                    expect(resOrg).toEqual(org);
    
                    done();
                })
                .catch(error => {
                    done(error);
                });
            });

            it('should return 400 & return error "Invalid JSON"', done => {
                const org = {};
    
                axios.post(`${serverUrl}/organizations`, org)
                .then(response => {
                    fail();
                })
                .catch(error => {
                    expect(error.response.status).toBe(400);
                    expect(error.response.data).toEqual({"message": "Invalid JSON"});
                    done();
                });
            });
        });
    });    
});
