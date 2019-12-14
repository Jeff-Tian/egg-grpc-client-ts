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
let mounted = false;
const healthChecks = {};
exports.default = async (app) => {
    if (mounted) {
        return;
    }
    app.addSingleton('grpcClient', getMultiTierServices);
    let config = app.config.grpcClient;
    Object.keys(config.clients).forEach(client => {
        healthChecks[client] = () => ({
            status: 'SERVING'
        });
    });
    const mount = config.mount || {};
    Object.keys(mount).forEach(key => {
        console.log('mounting ', key, mount[key]);
        app.router.get(mount[key], async (ctx) => {
            ctx.body = Object.assign({ health: true }, Object.keys(healthChecks).map((healthCheck) => ({
                [healthCheck]: healthChecks[healthCheck]()
            })).reduce((prev, next) => (Object.assign({}, prev, next)), {}));
        });
    });
    mounted = true;
};
async function getMultiTierServices(clientConfig, app) {
    console.log('config = ', clientConfig);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUF3QjtBQUN4QixtREFBNEI7QUFDNUIsbURBQTRCO0FBQzVCLG1EQUE0QjtBQUM1QixtRUFBNEM7QUFHNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUE7QUFFMUMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFBO0FBRW5CLE1BQU0sWUFBWSxHQUFZLEVBQUUsQ0FBQTtBQUVoQyxrQkFBZSxLQUFLLEVBQUUsR0FBZ0IsRUFBRSxFQUFFO0lBQ3RDLElBQUksT0FBTyxFQUFFO1FBQ1QsT0FBTTtLQUNUO0lBRUQsR0FBRyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtJQUVwRCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQTtJQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDekMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDMUIsTUFBTSxFQUFFLFNBQVM7U0FDcEIsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUE7SUFFRixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQTtJQUVoQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENB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