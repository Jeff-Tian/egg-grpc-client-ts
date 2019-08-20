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
                options = {};
            }
            console.log('options = =============== >>> ', options);
            method.call(client, arg, Object.assign({}, options, { deadline: new Date().getTime() + (Number(clientConfig.timeout) || 10000) }), (err, res) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUF3QjtBQUN4QixtREFBNEI7QUFDNUIsbURBQTRCO0FBQzVCLG1EQUE0QjtBQUM1QixtRUFBNEM7QUFFNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUE7QUFFMUMsa0JBQWUsS0FBSyxFQUFFLEdBQWdCLEVBQUUsRUFBRTtJQUN4QyxHQUFHLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3RELENBQUMsQ0FBQTtBQUVELEtBQUssVUFBVSxvQkFBb0IsQ0FDakMsWUFBMEIsRUFDMUIsR0FBZ0I7SUFFaEIsTUFBTSxRQUFRLEdBQVksRUFBRSxDQUFBO0lBQzVCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFL0QsSUFBSSxDQUFDLENBQUMsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtRQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixRQUFRLG1CQUFtQixHQUFHLENBQUMsT0FBTyw4QkFBOEIsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7S0FDNUk7SUFDRCxNQUFNLGFBQWEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUM3QyxLQUFLLE1BQU0sU0FBUyxJQUFJLGFBQWEsRUFBRTtRQUNyQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQ3hDLFNBQVE7U0FDVDtRQUVELE1BQU0sc0JBQXNCLEdBQUcsR0FB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