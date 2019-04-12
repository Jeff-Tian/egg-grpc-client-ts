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
        const relativeOrAbsolutePath = app.config.grpcClient.loaderOption && app.config.grpcClient.loaderOption.includeDirs ? protoFile : path.join(protoDir, protoFile);
        const proto = await loader.load(relativeOrAbsolutePath, app.config.grpcClient.loaderOption || {
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