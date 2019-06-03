import * as grpc from 'grpc'
import * as protoLoader from '@grpc/proto-loader'

const PROTO_PATH = __dirname + '/ProfileService.proto'
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
})

const proto: any = grpc.loadPackageDefinition(packageDefinition)

function main() {
    console.log('starting grpc server...')
    const server = new grpc.Server()
    server.addService(proto.passport.profile.ProfileService.service, {
        getUserInfo: (call: any, callback: any) => {
            console.log('getting calling from client: ', call)
            callback(null, call)
        }
    })

    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
    server.start()
    console.log('started grpc server ...')
}

main()
