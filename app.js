"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const util = require("util");
const grpc = require("grpc");
const loader = require("@grpc/proto-loader");
const exists = util.promisify(fs.exists);
const readdir = util.promisify(fs.readdir);
exports.default = async (app) => {
    // const clientServicesMap: Indexed = {}
    // await Promise.all(
    //     app.config.grpcClient.clients.map(async (clientConfig: ClientConfig) => {
    //         const services = await getMultiTierServices(app, clientConfig)
    //         clientServicesMap[clientConfig.name] = services
    //     }),
    // )
    app.addSingleton('grpcClient', getMultiTierServices);
    // app.grpcClient = clientServicesMap
};
async function getMultiTierServices(clientConfig, app) {
    const services = {};
    const protoDir = path.join(app.baseDir, clientConfig.protoPath);
    if (!(await exists(protoDir))) {
        throw new Error(`proto directory not exist: ${protoDir}, app.baseDir = ${app.baseDir}, clientConfig.protoPath = ${clientConfig.protoPath}`);
    }
    const protoFileList = await readdir(protoDir);
    for (const protoFile of protoFileList) {
        if (path.extname(protoFile) !== '.proto') {
            continue;
        }
        const proto = await loader.load(path.join(protoDir, protoFile), app.config.grpcClient.loaderOption || {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        const definition = grpc.loadPackageDefinition(proto);
        for (const packName of Object.keys(definition)) {
            if (!services[packName]) {
                services[packName] = definition[packName];
            }
            const tier = definition[packName];
            traverseDefinition(services, tier, packName, clientConfig);
        }
    }
    return services;
}
async function traverseDefinition(relevantParent, tier, tierName, clientConfig) {
    if (tier.name === 'ServiceClient') {
        return addServiceClient(relevantParent, tier, tierName, clientConfig);
    }
    for (const subTierName of Object.keys(tier)) {
        let relevantCurrent = relevantParent[tierName];
        if (!relevantCurrent) {
            relevantCurrent = relevantParent[tierName] = {};
        }
        traverseDefinition(relevantCurrent, tier[subTierName], subTierName, clientConfig);
    }
}
async function addServiceClient(relevantParent, tier, tierName, clientConfig) {
    const ServiceClient = tier;
    const address = `${clientConfig.host}:${clientConfig.port}`;
    const credentials = grpc.credentials.createInsecure();
    const client = new ServiceClient(address, credentials);
    relevantParent[tierName] = client;
    for (const methodName of Object.keys(ServiceClient.service)) {
        client[methodName] = util.promisify(client[methodName]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUJBQXdCO0FBQ3hCLDZCQUE0QjtBQUM1Qiw2QkFBNEI7QUFDNUIsNkJBQTRCO0FBQzVCLDZDQUE0QztBQUc1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUUxQyxrQkFBZSxLQUFLLEVBQUUsR0FBZ0IsRUFBRSxFQUFFO0lBQ3hDLHdDQUF3QztJQUN4QyxxQkFBcUI7SUFDckIsZ0ZBQWdGO0lBQ2hGLHlFQUF5RTtJQUN6RSwwREFBMEQ7SUFDMUQsVUFBVTtJQUNWLElBQUk7SUFDSixHQUFHLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO0lBQ3BELHFDQUFxQztBQUN2QyxDQUFDLENBQUE7QUFFRCxLQUFLLFVBQVUsb0JBQW9CLENBQ2pDLFlBQTBCLEVBQzFCLEdBQWdCO0lBRWhCLE1BQU0sUUFBUSxHQUFZLEVBQUUsQ0FBQTtJQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRS9ELElBQUksQ0FBQyxDQUFDLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7UUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsUUFBUSxtQkFBbUIsR0FBRyxDQUFDLE9BQU8sOEJBQThCLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO0tBQzVJO0lBQ0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDN0MsS0FBSyxNQUFNLFNBQVMsSUFBSSxhQUFhLEVBQUU7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