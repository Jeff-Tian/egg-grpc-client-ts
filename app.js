"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const util = tslib_1.__importStar(require("util"));
const grpc = tslib_1.__importStar(require("grpc"));
const loader = tslib_1.__importStar(require("@grpc/proto-loader"));
const Client_1 = tslib_1.__importDefault(require("grpc-man/lib/Client"));
const exists = util.promisify(fs.exists);
const readdir = util.promisify(fs.readdir);
let mounted = false;
const healthChecks = {};
exports.default = async (app) => {
    if (mounted) {
        return;
    }
    app.addSingleton('grpcClient', getMultiTierServices);
    const detectHealthStatus = async (client) => {
        try {
            return await new Client_1.default(client.host + ':' + client.port).grpc.grpc.health.v1.Health.check({ 'service': 'all' });
        }
        catch (err) {
            return err;
        }
    };
    let config = app.config.grpcClient;
    Object.keys(config.clients).forEach(client => {
        healthChecks[client] = async () => ({
            status: await detectHealthStatus(config.clients[client])
        });
    });
    const mount = config.mount || {};
    Object.keys(mount).forEach((key) => {
        const handler = async (ctx) => {
            const healthChecksPromises = Object.keys(healthChecks).map(async (healthCheck) => ({
                [healthCheck]: await healthChecks[healthCheck]()
            }));
            const healthChecksDone = await Promise.all(healthChecksPromises);
            ctx.body = healthChecksDone.reduce((prev, next) => (Object.assign({}, prev, next, { health: prev.health && next.status === 'SERVING' })), { health: true });
        };
        app.router.get(mount[key], handler);
    });
    mounted = true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUF3QjtBQUN4QixtREFBNEI7QUFDNUIsbURBQTRCO0FBQzVCLG1EQUE0QjtBQUM1QixtRUFBNEM7QUFFNUMseUVBQXdDO0FBRXhDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBRTFDLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQTtBQUVuQixNQUFNLFlBQVksR0FBWSxFQUFFLENBQUE7QUFFaEMsa0JBQWUsS0FBSyxFQUFFLEdBQWdCLEVBQUUsRUFBRTtJQUN0QyxJQUFJLE9BQU8sRUFBRTtRQUNULE9BQU07S0FDVDtJQUVELEdBQUcsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUE7SUFFcEQsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsTUFBVyxFQUFFLEVBQUU7UUFDN0MsSUFBSTtZQUNBLE9BQU8sTUFBTSxJQUFJLGdCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUE7U0FDaEg7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE9BQU8sR0FBRyxDQUFBO1NBQ2I7SUFDTCxDQUFDLENBQUE7SUFFRCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQTtJQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFP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