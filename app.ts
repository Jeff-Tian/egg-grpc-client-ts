import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import * as grpc from 'grpc'
import * as loader from '@grpc/proto-loader'
import { Application } from 'egg'

const exists = util.promisify(fs.exists)
const readdir = util.promisify(fs.readdir)

export default async (app: Application) => {
  // const clientServicesMap: Indexed = {}
  // await Promise.all(
  //     app.config.grpcClient.clients.map(async (clientConfig: ClientConfig) => {
  //         const services = await getMultiTierServices(app, clientConfig)
  //         clientServicesMap[clientConfig.name] = services
  //     }),
  // )
  app.addSingleton('grpcClient', getMultiTierServices)
  // app.grpcClient = clientServicesMap
}

async function getMultiTierServices(
  clientConfig: ClientConfig,
  app: Application,
) {
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
      traverseDefinition(services, tier, packName, clientConfig)
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
    traverseDefinition(
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
    client[methodName] = util.promisify(client[methodName])
  }
}
