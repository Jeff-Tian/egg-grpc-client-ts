import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import * as grpc from 'grpc'
import * as loader from '@grpc/proto-loader'
import {Application, Context} from 'egg'

const exists = util.promisify(fs.exists)
const readdir = util.promisify(fs.readdir)

let mounted = false

const healthChecks: Indexed = {}

export default async (app: Application) => {
    if (mounted) {
        return
    }

    app.addSingleton('grpcClient', getMultiTierServices)

    let config = app.config.grpcClient
    Object.keys(config.clients).forEach(client => {
        healthChecks[client] = () => ({
            status: 'SERVING'
        })
    })

    const mount = config.mount || {}

    Object.keys(mount).forEach(key => {
        console.log('mounting ', key, mount[key])
        app.router.get(mount[key], async (ctx: Context) => {
            ctx.body = {
                health: true,
                ...Object.keys(healthChecks).map((healthCheck: any) => ({
                    [healthCheck]: healthChecks[healthCheck]()
                })).reduce((prev: Indexed, next: any) => ({...prev, ...next}), {})
            }
        })
    })

    mounted = true
}

async function getMultiTierServices(
    clientConfig: ClientConfig,
    app: Application,
) {
    console.log('config = ', clientConfig)
    const services: Indexed = {}
    const protoDir = path.join(app.baseDir, clientConfig.protoPath)

    if (!(await exists(protoDir))) {
        throw new Error(`proto directory not exist: ${protoDir}, app.baseDir = ${app.baseDir}, clientConfig.protoPath = ${clientConfig.protoPath}`)
    }
    const protoFileList = await readdir(protoDir)
    for (const protoFile of protoFileList) {
        if (path.extname(protoFile) !== '.proto') {
            continue
        }

        const relativeOrAbsolutePath = app.config.grpcClient.loaderOption && app.config.grpcClient.loaderOption.includeDirs ? protoFile : path.join(protoDir, protoFile)

        const proto = await loader.load(
            relativeOrAbsolutePath,
            app.config.grpcClient.loaderOption || {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            },
        )
        const definition = grpc.loadPackageDefinition(proto)

        for (const packName of Object.keys(definition)) {
            if (!services[packName]) {
                services[packName] = definition[packName]
            }
            const tier: Indexed = definition[packName]
            await traverseDefinition(services, tier, packName, clientConfig)
        }
    }
    return services
}

async function traverseDefinition(
    relevantParent: any,
    tier: any,
    tierName: string,
    clientConfig: ClientConfig,
) {
    if (tier.name === 'ServiceClient') {
        return addServiceClient(relevantParent, tier, tierName, clientConfig)
    }

    for (const subTierName of Object.keys(tier)) {
        let relevantCurrent = relevantParent[tierName]
        if (!relevantCurrent) {
            relevantCurrent = relevantParent[tierName] = {}
        }
        await traverseDefinition(
            relevantCurrent,
            tier[subTierName],
            subTierName,
            clientConfig,
        )
    }
}

async function addServiceClient(
    relevantParent: any,
    tier: any,
    tierName: string,
    clientConfig: ClientConfig,
) {
    const ServiceClient = tier
    const address = `${clientConfig.host}:${clientConfig.port}`
    const credentials = grpc.credentials.createInsecure()
    const client = new ServiceClient(address, credentials)

    relevantParent[tierName] = client
    for (const methodName of Object.keys(ServiceClient.service)) {
        const method = client[methodName]

        client[methodName] = util.promisify((arg: any, options: any, callback: (err: any, res: any) => void) => {
            if (typeof options === 'function') {
                callback = options
                options = {}
            }

            method.call(client, arg, {
                ...options,
                deadline: new Date().getTime() + (Number(clientConfig.timeout) || 10000)
            }, (err: any, res: any) => {
                if (err) {
                    err = {
                        ...err,
                        meta: {
                            address,
                            clientConfig,
                            service: tierName,
                            method: methodName,
                            arg,
                            options
                        },
                    }
                }

                callback(err, res)
            })
        })
    }
}
