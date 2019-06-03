"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_1 = require("grpc");
function traverseTerminalNodes(obj, traverseAction, maxDepth = 100) {
    if (maxDepth <= 0) {
        throw new Error('层级太深了！');
    }
    Object.keys(obj).forEach(value => {
        if (typeof obj[value] !== 'object') {
            traverseAction(obj[value], value, obj);
        }
        else {
            traverseTerminalNodes(obj[value], traverseAction, maxDepth - 1);
        }
    });
}
exports.default = () => {
    return async (ctx, next) => {
        ctx.grpcmeta = new grpc_1.Metadata();
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
                ctx.grpcmeta.add(item, ctx.headers[item]);
            }
        });
        ctx.grpcmeta.add('x-egg-grpc-client', 'true');
        const iter = ctx.app.grpcClient.clients.keys();
        let element = iter.next();
        while (!element.done) {
            const proto = ctx.app.grpcClient.get(element.value);
            traverseTerminalNodes(proto, (v, key, parent) => {
                if (typeof v === 'function') {
                    parent[key] = (arg, options) => {
                        return v(arg, Object.assign({}, options, ctx.grpcmeta));
                    };
                }
            });
            element = iter.next();
        }
        return next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JwY01ldGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJncnBjTWV0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtCQUE2QjtBQUU3QixTQUFTLHFCQUFxQixDQUMxQixHQUFRLEVBQ1IsY0FBcUUsRUFDckUsUUFBUSxHQUFHLEdBQUc7SUFFZCxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7UUFDZixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzVCO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDN0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDaEMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUE7U0FDekM7YUFBTTtZQUNILHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxjQUFjLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ2xFO0lBQ0wsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDO0FBRUQsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE9BQU8sS0FBSyxFQUFFLEdBQVksRUFBRSxJQUFjLEVBQUUsRUFBRTtRQUMxQyxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksZUFBUSxFQUFFLENBQUM7UUFDOUI7WUFDSSxjQUFjO1lBQ2QsY0FBYztZQUNkLGFBQWE7WUFDYixtQkFBbUI7WUFDbkIsY0FBYztZQUNkLFlBQVk7WUFDWixtQkFBbUI7U0FDdEIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDYixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7YUFDNUM7UUFDTCxDQUFDLENBQUMsQ0FBQTtRQUVGLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRTdDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUU5QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDekIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDbEIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUVuRCxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUM1QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFVBQVUsRUFBRTtvQkFDekIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBUSxFQUFFLE9BQVksRUFBRSxFQUFFO3dCQUNyQyxPQUFPLENBQUMsQ0FBQyxHQUFHLG9CQUFNLE9BQU8sRUFBSyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUE7b0JBQ2hELENBQUMsQ0FBQTtpQkFDSjtZQUNMLENBQUMsQ0FBQyxDQUFBO1lBRUYsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtTQUN4QjtRQUVELE9BQU8sSUFBSSxFQUFFLENBQUE7SUFDakIsQ0FBQyxDQUFBO0FBQ0wsQ0FBQyxDQUFBIn0=