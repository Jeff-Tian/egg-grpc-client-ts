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
    if (app.config.coreMiddleware.indexOf('grpcMeta') < 0) {
        app.config.coreMiddleware.push('grpcMeta');
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUF3QjtBQUN4QixtREFBNEI7QUFDNUIsbURBQTRCO0FBQzVCLG1EQUE0QjtBQUM1QixtRUFBNEM7QUFFNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUE7QUFFMUMsa0JBQWUsS0FBSyxFQUFFLEdBQWdCLEVBQUUsRUFBRTtJQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUE7SUFDbEMsR0FBRyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtJQUVwRCxJQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUM7UUFDbkQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzNDO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsS0FBSyxVQUFVLG9CQUFvQixDQUNqQyxZQUEwQixFQUMxQixHQUFnQjtJQUVoQixNQUFNLFFBQVEsR0FBWSxFQUFFLENBQUE7SUFDNUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUUvRCxJQUFJLENBQUMsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLFFBQVEsbUJBQW1CLEdBQUcsQ0FBQyxPQUFPLDhCQUE4QixZQUFZLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQTtLQUM1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