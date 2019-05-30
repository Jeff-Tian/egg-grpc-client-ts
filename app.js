"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const util = tslib_1.__importStar(require("util"));
const grpc = tslib_1.__importStar(require("grpc"));
const loader = tslib_1.__importStar(require("@grpc/proto-loader"));
const exists = util.promisify(fs.exists);
const readdir = util.promisify(fs.readdir);
exports.default = async (app) => {
    console.log('adding Singleton...');
    app.addSingleton('grpcClient', getMultiTierServices);
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
            await traverseDefinition(services, tier, packName, clientConfig);
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
        await traverseDefinition(relevantCurrent, tier[subTierName], subTierName, clientConfig);
    }
}
async function addServiceClient(relevantParent, tier, tierName, clientConfig) {
    const ServiceClient = tier;
    const address = `${clientConfig.host}:${clientConfig.port}`;
    const credentials = grpc.credentials.createInsecure();
    const client = new ServiceClient(address, credentials);
    relevantParent[tierName] = client;
    for (const methodName of Object.keys(ServiceClient.service)) {
        const method = client[methodName];
        client[methodName] = util.promisify((arg, options, callback) => {
            if (typeof options === 'function') {
                callback = options;
                options = { deadline: new Date().getTime() + (Number(clientConfig.timeout) || 10000) };
            }
            console.log('options ============== >>>>> ', options);
            method.call(client, arg, options, (err, res) => {
                if (err) {
                    err = Object.assign({}, err, { meta: {
                            address,
                            clientConfig,
                            service: tierName,
                            method: methodName,
                            arg,
                            options
                        } });
                }
                callback(err, res);
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUF3QjtBQUN4QixtREFBNEI7QUFDNUIsbURBQTRCO0FBQzVCLG1EQUE0QjtBQUM1QixtRUFBNEM7QUFFNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUE7QUFFMUMsa0JBQWUsS0FBSyxFQUFFLEdBQWdCLEVBQUUsRUFBRTtJQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUE7SUFDbEMsR0FBRyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtBQUN0RCxDQUFDLENBQUE7QUFFRCxLQUFLLFVBQVUsb0JBQW9CLENBQ2pDLFlBQTBCLEVBQzFCLEdBQWdCO0lBRWhCLE1BQU0sUUFBUSxHQUFZLEVBQUUsQ0FBQTtJQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRS9ELElBQUksQ0FBQyxDQUFDLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7UUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsUUFBUSxtQkFBbUIsR0FBRyxDQUFDLE9BQU8sOEJBQThCLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO0tBQzVJO0lBQ0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDN0MsS0FBSyxNQUFNLFNBQVMsSUFBSSxhQUFhLEVBQUU7UUFDckMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLFFBQVEsRUFB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