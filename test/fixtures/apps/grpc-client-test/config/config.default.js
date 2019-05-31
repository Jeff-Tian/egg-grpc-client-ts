'use strict';

module.exports = (appInfo)=>{
    const config = {}

    config.keys = '123456';

    config.grpcClient = {
        host: '0.0.0.0',
        port: '50051',
        loaderOption: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        },
        clients: {
            passport: {
                protoPath: 'grpc',
                host: '0.0.0.0',
                port: '50051',
            }
        }
    };


    return config;
}
