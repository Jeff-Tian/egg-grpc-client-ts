# egg-grpc-client-ts

> TypeScript 版的 egg grpc client 插件。

Inspired by [egg-grpc-client](https://github.com/tw949561391/egg-grpc-client).

[![NPM version][npm-image]][npm-url]
[![Build Status](https://travis-ci.com/Jeff-Tian/egg-grpc-client-ts.svg?branch=master)](https://travis-ci.com/Jeff-Tian/egg-grpc-client-ts)
[![codecov](https://codecov.io/gh/Jeff-Tian/egg-grpc-client-ts/branch/master/graph/badge.svg)](https://codecov.io/gh/Jeff-Tian/egg-grpc-client-ts)
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-grpc-client-ts.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-grpc-client
[david-image]: https://img.shields.io/david/jeff-tian/egg-grpc-client-ts.svg?style=flat-square
[david-url]: https://david-dm.org/jeff-tian/egg-grpc-client-ts
[snyk-image]: https://snyk.io/test/npm/egg-grpc-client-ts/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-grpc-client-ts
[download-image]: https://img.shields.io/npm/dm/egg-grpc-client-ts.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-grpc-client-ts

<!--
Description here.
-->

## 依赖说明

### 依赖的 egg 版本

egg-grpc-client 版本 | egg 1.x
--- | ---
1.x | 😁
0.x | ❌

### 依赖的插件
<!--

如果有依赖其它插件，请在这里特别说明。如

- security
- multipart

-->

## 安装使用
```shell
npm i egg-grpc-client-ts --save
```

## 开启插件

```js
// config/plugin.[t|j]s
exports.grpcClient = {
  enable: true,
  package: 'egg-grpc-client-ts',
};
```

## 使用场景

- 用作 BFF 层的 egg 项目，需要使用 gRPC 调用后台 service。

## 详细配置

请到 [config/config.default.ts](config/config.default.ts) 查看详细配置项说明。

## 开发
```shell
# 确保本地单元测试
npm run test-local

# 发布
npm publish
```

## License

[MIT](LICENSE)

## 发布日志：

- **1.1.5**: 报错时，把相关 server address, service, method, 参数 等元信息带上。

- **1.1.6**: fail fast。默认超时时间为 10 秒（原来默认 1 分钟，太长了）

- **2.0.1**: 允许传入 grpcMeta，实现分布式链路跟踪

