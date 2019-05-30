"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const grpc = tslib_1.__importStar(require("grpc"));
const protoLoader = tslib_1.__importStar(require("@grpc/proto-loader"));
const PROTO_PATH = __dirname + '/ProfileService.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition);
function main() {
    const server = new grpc.Server();
    server.addService(proto.passport.profile.ProfileService.service, {
        getUserInfo: (call, callback) => {
            console.log('getting calling from client: ', call);
            callback(null, call);
        }
    });
    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('started grpc server ...');
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JwYy1zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJncnBjLXNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBNEI7QUFDNUIsd0VBQWlEO0FBRWpELE1BQU0sVUFBVSxHQUFHLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQTtBQUN0RCxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO0lBQ3ZELFFBQVEsRUFBRSxJQUFJO0lBQ2QsS0FBSyxFQUFFLE1BQU07SUFDYixLQUFLLEVBQUUsTUFBTTtJQUNiLFFBQVEsRUFBRSxJQUFJO0lBQ2QsTUFBTSxFQUFFLElBQUk7Q0FDZixDQUFDLENBQUE7QUFFRixNQUFNLEtBQUssR0FBUSxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUVoRSxTQUFTLElBQUk7SUFDVCxNQUFNLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUU7UUFDN0QsV0FBVyxFQUFFLENBQUMsSUFBUyxFQUFFLFFBQWEsRUFBRSxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDbEQsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUN4QixDQUFDO0tBQ0osQ0FBQyxDQUFBO0lBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUE7SUFDckUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0FBQzFDLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQSJ9