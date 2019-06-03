# egg-grpc-client-ts

> TypeScript version of egg grpc client plugin.

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

## Install

```bash
$ npm i egg-grpc-client-ts --save
```

## Usage

```js
// {app_root}/config/plugin.[t|j]s
exports.grpcClient = {
  enable: true,
  package: 'egg-grpc-client-ts',
};
```

## Configuration

```js
// {app_root}/config/config.default.[t|j]s
exports.grpcClient = {
  clients: [
    {
      name: 'main',
      protoPath: 'app/proto/main',
      host: '0.0.0.0',
      port: 50051,
    },
  ],
};
```

see [config/config.default.ts](config/config.default.ts) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)

## Test

```shell
# start test grpc server
npm run test-server

# In another shell, run:
npm run test-local
```

## Release Notes:
- **1.1.5**: 报错时，把相关 server address, service, method, 参数 等元信息带上。

- **1.1.6**: fail fast。默认超时时间为 10 秒（原来默认 1 分钟，太长了）

- **2.0.1**: 允许传入 grpcMeta，实现分布式链路跟踪
