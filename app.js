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
        console.log('mounting ', key, mount[key]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUF3QjtBQUN4QixtREFBNEI7QUFDNUIsbURBQTRCO0FBQzVCLG1EQUE0QjtBQUM1QixtRUFBNEM7QUFFNUMseUVBQXdDO0FBRXhDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBRTFDLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQTtBQUVuQixNQUFNLFlBQVksR0FBWSxFQUFFLENBQUE7QUFFaEMsa0JBQWUsS0FBSyxFQUFFLEdBQWdCLEVBQUUsRUFBRTtJQUN0QyxJQUFJLE9BQU8sRUFBRTtRQUNULE9BQU07S0FDVDtJQUVELEdBQUcsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUE7SUFFcEQsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsTUFBVyxFQUFFLEVBQUU7UUFDN0MsSUFBSTtZQUNBLE9BQU8sTUFBTSxJQUFJLGdCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUE7U0FDaEg7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE9BQU8sR0FBRyxDQUFBO1NBQ2I7SUFDTCxDQUFDLENBQUE7SUFFRCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQTtJQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDekMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNoQyxNQUFNLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNELENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQyxDQUFBO0lBRUYsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUE7SUFFaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFFekMsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEdBQVksRUFBRSxFQUFFO1lBQ25DLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFdBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZGLENBQUMsV0FBVyxDQUFDLEVBQUUsTUFBTSxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUU7YUFDbkQsQ0FBQyxDQUFDLENBQUE7WUFFSCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1lBRWhFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBYSxFQUFFLElBQVMsRUFBRSxFQUFFLENBQUMsbUJBQzFELElBQUksRUFBSyxJQUFJLElBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUNsRCxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUE7UUFDdkIsQ0FBQyxDQUFBO1FBRUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3ZDLENBQUMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxHQUFHLElBQUksQ0FBQTtBQUNsQixDQUFDLENBQUE7QUFFRCxLQUFLLFVBQVUsb0JBQW9CLENBQy9CLFlBQTBCLEVBQzFCLEdBQWdCO0lBRWhCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sUUFBUSxHQUFZLEVBQUUsQ0FBQTtJQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRS9ELElBQUksQ0FBQyxDQUFDLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsUUFBUSxtQkFBbUIsR0FBRyxDQUFDLE9BQU8sOEJBQThCLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO0tBQzlJO0lBQ0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDN0MsS0FBSyxNQUFNLFNBQVMsSUFBSSxhQUFhLEVBQUU7UUFDbkMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUN0QyxTQUFRO1NBQ1g7UUFFRCxNQUFNLHNCQUFzQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBRWhLLE1BQU0sS0FBSyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FDM0Isc0JBQXNCLEVBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSTtZQUNsQyxRQUFRLEVBQUUsSUFBSTtZQUNkLEtBQUssRUFBRSxNQUFNO1lBQ2IsS0FBSyxFQUFFLE1BQU07WUFDYixRQUFRLEVBQUUsSUFBSTtZQUNkLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FDSixDQUFBO1FBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRXBELEtBQUssTUFBTSxRQUFRLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNyQixRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2FBQzVDO1lBQ0QsTUFBTSxJQUFJLEdBQVksVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQzFDLE1BQU0sa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUE7U0FDbkU7S0FDSjtJQUNELE9BQU8sUUFBUSxDQUFBO0FBQ25CLENBQUM7QUFFRCxLQUFLLFVBQVUsa0JBQWtCLENBQzdCLGNBQW1CLEVBQ25CLElBQVMsRUFDVCxRQUFnQixFQUNoQixZQUEwQjtJQUUxQixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssZUFBZSxFQUFFO1FBQy9CLE9BQU8sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUE7S0FDeEU7SUFFRCxLQUFLLE1BQU0sV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDekMsSUFBSSxlQUFlLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDbEIsZUFBZSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUE7U0FDbEQ7UUFDRCxNQUFNLGtCQUFrQixDQUNwQixlQUFlLEVBQ2YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUNqQixXQUFXLEVBQ1gsWUFBWSxDQUNmLENBQUE7S0FDSjtBQUNMLENBQUM7QUFFRCxLQUFLLFVBQVUsZ0JBQWdCLENBQzNCLGNBQW1CLEVBQ25CLElBQVMsRUFDVCxRQUFnQixFQUNoQixZQUEwQjtJQUUxQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUE7SUFDMUIsTUFBTSxPQUFPLEdBQUcsR0FBRyxZQUFZLENBQUMsSUFBSSxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUMzRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFBO0lBQ3JELE1BQU0sTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUV0RCxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFBO0lBQ2pDLEtBQUssTUFBTSxVQUFVLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDekQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBRWpDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBUSxFQUFFLE9BQVksRUFBRSxRQUFzQyxFQUFFLEVBQUU7WUFDbkcsSUFBSSxPQUFPLE9BQU8sS0FBSyxVQUFVLEVBQUU7Z0JBQy9CLFFBQVEsR0FBRyxPQUFPLENBQUE7Z0JBQ2xCLE9BQU8sR0FBRyxFQUFFLENBQUE7YUFDZjtZQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsb0JBQ2hCLE9BQU8sSUFDVixRQUFRLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQ3pFLENBQUMsR0FBUSxFQUFFLEdBQVEsRUFBRSxFQUFFO2dCQUN0QixJQUFJLEdBQUcsRUFBRTtvQkFDTCxHQUFHLHFCQUNJLEdBQUcsSUFDTixJQUFJLEVBQUU7NEJBQ0YsT0FBTzs0QkFDUCxZQUFZOzRCQUNaLE9BQU8sRUFBRSxRQUFROzRCQUNqQixNQUFNLEVBQUUsVUFBVTs0QkFDbEIsR0FBRzs0QkFDSCxPQUFPO3lCQUNWLEdBQ0osQ0FBQTtpQkFDSjtnQkFFRCxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ3RCLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFDLENBQUE7S0FDTDtBQUNMLENBQUMifQ==