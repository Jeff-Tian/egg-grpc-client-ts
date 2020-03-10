'use strict';
/**
 * egg-grpc-client default config
 * @member Config#grpcClient
 * @property {String} SOME_KEY - some description
 */
exports.grpcClient = {
    clients: [
        {
            name: 'main',
            protoPath: 'app/proto/main',
            host: '0.0.0.0',
            port: 50051,
        },
    ],
    mount: {
        'health-check': '/grpc-health'
    },
    maxRecursiveCalls: 10000
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb25maWcuZGVmYXVsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWjs7OztHQUlHO0FBQ0gsT0FBTyxDQUFDLFVBQVUsR0FBRztJQUNqQixPQUFPLEVBQUU7UUFDTDtZQUNJLElBQUksRUFBRSxNQUFNO1lBQ1osU0FBUyxFQUFFLGdCQUFnQjtZQUMzQixJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxLQUFLO1NBQ2Q7S0FDSjtJQUNELEtBQUssRUFBRTtRQUNILGNBQWMsRUFBRSxjQUFjO0tBQ2pDO0lBQ0QsaUJBQWlCLEVBQUUsS0FBSztDQUMzQixDQUFBIn0=