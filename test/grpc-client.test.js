"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_1 = require("grpc");
const mock = require("egg-mock");
describe("test/grpc-client.test.js", () => {
    let app;
    before(async () => {
        app = mock.app({
            baseDir: "apps/grpc-client-test"
        });
        return await app.ready();
    });
    after(() => app.close());
    afterEach(mock.restore);
    it("should GET /", async () => {
        const metaData = new grpc_1.Metadata();
        metaData.add('x-request-id', '1234');
        await new Promise((resolve, reject) => {
            app.grpcClient
                .get("passport")
                .passport.profile.ProfileService.getUserInfo({
                userId: "230371e2-eb07-4b2b-aa61-73fd27c5387e"
            }, metaData)
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
            .expect("hi, grpcClient")
            .expect(200);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JwYy1jbGllbnQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdycGMtY2xpZW50LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUNaLCtCQUE2QjtBQUU3QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7QUFFaEMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtJQUN0QyxJQUFJLEdBQVEsQ0FBQTtJQUNaLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNkLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1gsT0FBTyxFQUFFLHVCQUF1QjtTQUNuQyxDQUFDLENBQUE7UUFDRixPQUFPLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQzVCLENBQUMsQ0FBQyxDQUFBO0lBRUYsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQ3hCLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFFdkIsRUFBRSxDQUFDLGNBQWMsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQVEsRUFBRSxDQUFBO1FBQy9CLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRXBDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbEMsR0FBRyxDQUFDLFVBQVU7aUJBQ1QsR0FBRyxDQUFDLFVBQVUsQ0FBQztpQkFDZixRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7Z0JBQzdDLE1BQU0sRUFBRSxzQ0FBc0M7YUFDakQsRUFBRSxRQUFRLENBQUM7aUJBQ1AsSUFBSSxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ3pCLE9BQU8sRUFBRSxDQUFBO1lBQ2IsQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFBO2dCQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDYixDQUFDLENBQUMsQ0FBQTtRQUNWLENBQUMsQ0FBQyxDQUFBO1FBRUYsT0FBTyxHQUFHO2FBQ0wsV0FBVyxFQUFFO2FBQ2IsR0FBRyxDQUFDLEdBQUcsQ0FBQzthQUNSLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQzthQUN4QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDcEIsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQSJ9