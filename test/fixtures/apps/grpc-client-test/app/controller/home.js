'use strict'
const Controller = require('egg').Controller


class HomeController extends Controller {
  async index() {
    const result = await this.app.grpcClient
        .get('passport')
        .passport.profile.ProfileService.getUserInfo({
          userId: '230371e2-eb07-4b2b-aa61-73fd27c5387e',
        })

    this.ctx.body = {
      message: 'hi, ' + this.app.plugins.grpcClient.name,
      result,
    }
  }
}

module.exports = HomeController
