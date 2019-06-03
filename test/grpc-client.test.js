"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_1 = require("grpc");
const child_process_1 = require("child_process");
const mock = require("egg-mock");
describe("test/grpc-client.test.js", () => {
    let app;
    let grpcServer;
    before(async () => {
        grpcServer = child_process_1.spawn('ts-node', ['test/fixtures/apps/grpc-client-test/grpc/grpc-server.ts'], {
            detached: true,
        });
        grpcServer.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
        console.log('grpc server started...', grpcServer.killed);
        await new Promise((resolve, reject) => {
            let i = 0;
            grpcServer.stdout.on('data', (data) => {
                console.log(`received data ${i++}:`, data.toString());
                resolve(data);
            });
            grpcServer.stderr.on('data', (data) => {
                console.error(`received error: `, data.toString());
                reject(data);
            });
        });
        app = mock.app({
            baseDir: "apps/grpc-client-test"
        });
        return await app.ready();
    });
    after(() => {
        app.close();
        console.log('grpcServer is ', grpcServer.killed);
        if (!grpcServer.killed) {
            grpcServer.kill();
        }
    });
    afterEach(mock.restore);
    it("should GET /", async () => {
        const metaData = new grpc_1.Metadata();
        metaData.add('x-request-id', '1234');
        await new Promise((resolve, reject) => {
            app.grpcClient
                .get("passport")
                .passport.profile.ProfileService.getUserInfo({
                userId: "230371e2-eb07-4b2b-aa61-73fd27c5387e"
            })
                .then((res) => {
                console.log('结果 = ', res);
                resolve();
            })
                .catch((e) => {
                console.error('碰到错误！', e);
                reject(e);
            });
        });
        return app
            .httpRequest()
            .get("/")
            .expect({
            "message": "hi, grpcClient",
            "result": { "userId": "", "username": "", "avatar": "", "nickname": "", "gender": "" }
        })
            .expect(200);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JwYy1jbGllbnQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdycGMtY2xpZW50LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBNkI7QUFDN0IsaURBQW1DO0FBRW5DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUVoQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO0lBQ3RDLElBQUksR0FBUSxDQUFBO0lBQ1osSUFBSSxVQUFlLENBQUE7SUFDbkIsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2QsVUFBVSxHQUFHLHFCQUFLLENBQUMsU0FBUyxFQUFFLENBQUMseURBQXlELENBQUMsRUFBRTtZQUN2RixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUE7UUFFRixVQUFVLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQVMsRUFBRSxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLElBQUksRUFBRSxDQUFDLENBQUE7UUFDekQsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUV4RCxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNULFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQVMsRUFBRSxFQUFFO2dCQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO2dCQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDakIsQ0FBQyxDQUFDLENBQUE7WUFFRixVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFTLEVBQUUsRUFBRTtnQkFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtnQkFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ2hCLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFDLENBQUE7UUFFRixHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNYLE9BQU8sRUFBRSx1QkFBdUI7U0FDbkMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxNQUFNLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUM1QixDQUFDLENBQUMsQ0FBQTtJQUVGLEtBQUssQ0FBQyxHQUFHLEVBQUU7UUFDUCxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNwQixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUE7U0FDcEI7SUFDTCxDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFFdkIsRUFBRSxDQUFDLGNBQWMsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQVEsRUFBRSxDQUFBO1FBQy9CLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRXBDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbEMsR0FBRyxDQUFDLFVBQVU7aUJBQ1QsR0FBRyxDQUFDLFVBQVUsQ0FBQztpQkFDZixRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7Z0JBQzdDLE1BQU0sRUFBRSxzQ0FBc0M7YUFDakQsQ0FBQztpQkFDRyxJQUFJLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQTtnQkFDekIsT0FBTyxFQUFFLENBQUE7WUFDYixDQUFDLENBQUM7aUJBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUE7Z0JBQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNiLENBQUMsQ0FBQyxDQUFBO1FBQ1YsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPLEdBQUc7YUFDTCxXQUFXLEVBQUU7YUFDYixHQUFHLENBQUMsR0FBRyxDQUFDO2FBQ1IsTUFBTSxDQUFDO1lBQ0osU0FBUyxFQUFFLGdCQUFnQjtZQUMzQixRQUFRLEVBQUUsRUFBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUM7U0FDdkYsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNwQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFBIn0=