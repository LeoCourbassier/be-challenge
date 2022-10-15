import { Request, Response } from "express";

export function Logger() {
    return function (target: any, propertyName: any, descriptor: any) {
        const method = descriptor.value;
        
        descriptor.value = async function(...args: any) {
            const start = new Date()
            const req = args[0] as Request;
            const fullUrl = req.baseUrl + req.path;
            console.info(`✏️[${formatDate(start)}](${method.name}): ${req.method} ${fullUrl}`);
            console.debug("🔍", args[0].body);
            try {
                return await method.apply(this, args);
            } catch(error) {
                const end = new Date()
                console.error(`🚨[${formatDate(end)}](${method.name}): ${error.message}`);
                console.debug("🔍", error);
            } finally {
                const end = new Date()
                const res = args[1] as Response;
                console.info(`✅[${formatDate(end)}](${method.name}): request processed in ${(end.getTime() - start.getTime())}ms with status ${res.statusCode}`);
            }
        };
    }
}

function formatDate(date: Date) {
    return date.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}