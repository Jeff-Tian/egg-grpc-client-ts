"use strict"
import {Metadata} from 'grpc'

const mock = require("egg-mock")

describe("test/grpc-client.test.js", () => {
    let app: any
    before(async () => {
        app = mock.app({
            baseDir: "apps/grpc-client-test"
        })
        return await app.ready()
    })

    after(() => app.close())
    afterEach(mock.restore)

    it("should GET /", async () => {
        const metaData = new Metadata()
        metaData.add('x-request-id', '1234')

        await new Promise((resolve, reject) => {
            app.grpcClient
                .get("passport")
                .passport.profile.ProfileService.getUserInfo({
                userId: "230371e2-eb07-4b2b-aa61-73fd27c5387e"
            })
                .then((res: any) => {
                    console.log('结果 = ', res)
                    resolve()
                })
                .catch((e: any) => {
                    console.error('碰到错误！', e)
                    reject(e)
                })
        })

        return app
            .httpRequest()
            .get("/")
            .expect({
                "message": "hi, grpcClient",
                "result": {"userId": "", "username": "", "avatar": "", "nickname": "", "gender": ""}
            })
            .expect(200)
    })
})
