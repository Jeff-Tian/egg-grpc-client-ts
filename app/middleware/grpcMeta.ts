import {Context} from 'egg'
import {Metadata} from 'grpc'

function traverseTerminalNodes(
    obj: any,
    traverseAction: (currentValue: any, key: string, parent: any) => void,
    maxDepth = 100,
) {
    if (maxDepth <= 0) {
        throw new Error('层级太深了！')
    }

    Object.keys(obj).forEach(value => {
        if (typeof obj[value] !== 'object') {
            traverseAction(obj[value], value, obj)
        } else {
            traverseTerminalNodes(obj[value], traverseAction, maxDepth - 1)
        }
    })
}

export default () => {
    return async (ctx: Context, next: Function) => {
        ctx.grpcmeta = new Metadata();
        [
            'x-request-id',
            'x-b3-traceid',
            'x-b3-spanid',
            'x-b3-parentspanid',
            'x-b3-sampled',
            'x-b3-flags',
            'x-ot-span-context',
        ].forEach(item => {
            if (ctx.headers[item]) {
                ctx.grpcmeta.add(item, ctx.headers[item])
            }
        })

        ctx.grpcmeta.add('x-egg-grpc-client', 'true')

        const iter = ctx.app.grpcClient.clients.keys()

        let element = iter.next()
        while (!element.done) {
            const proto = ctx.app.grpcClient.get(element.value)

            traverseTerminalNodes(proto, (v, key, parent) => {
                if (typeof v === 'function') {
                    parent[key] = (arg: any, options: any) => {
                        return v(arg, {...options, ...ctx.grpcmeta})
                    }
                }
            })

            element = iter.next()
        }

        return next()
    }
}
