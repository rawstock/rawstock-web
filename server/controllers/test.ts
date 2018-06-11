import { router, required, prefix, log } from '../middlewares/router';

@prefix('/test')

export default class TestController {

  // http://localhost:8083/test/user/zhangsan
  @router({
    method: 'get',
    path: '/user/:username'
  })
  @required({ params: 'username' })
  @log
  async getUserOne(ctx: any): Promise<void> {
    const user = {
      username: ctx.params.username
    }
    ctx.body = user;
  }

}
