import {Metadata} from 'grpc'
import {spawn} from 'child_process'

const mock = require("egg-mock")

describe("test/grpc-client.test.js", () => {
    let app: any
    let grpcServer: any
    before(async () => {
        grpcServer = spawn('ts-node', ['test/fixtures/apps/grpc-client-test/grpc/grpc-server.ts'], {
            detached: true,
        })

        grpcServer.on('close', (code: any) => {
            console.log(`child process exited with code ${code}`)
        })

        console.log('grpc server started...', grpcServer.killed)

        await new Promise((resolve, reject) => {
            let i = 0
            grpcServer.stdout.on('data', (data: any) => {
                console.log(`received data ${i++}:`, data.toString())
                resolve(data)
            })

            grpcServer.stderr.on('data', (data: any) => {
                console.error(`received error: `, data.toString())
                reject(data)
            })
        })

        app = mock.app({
            baseDir: "apps/grpc-client-test"
        })
        return await app.ready()
    })

    after(() => {
        app.close()
        console.log('grpcServer is ', grpcServer.killed)
        if (!grpcServer.killed) {
            grpcServer.kill()
        }
    })

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

    it('should get /grpc-health', async () => {

        return app
            .httpRequest()
            .get("/grpc-health")
            .expect(200)
            .expect({
                health: true,
                passport: {status: 'SERVING'}
            })
    })
})
