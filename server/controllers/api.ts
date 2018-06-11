import * as Koa from 'koa';
import * as rawstock from 'rawstock'
import { router, prefix } from '../middlewares/router';
import * as NodeCache from 'node-cache'

const myCache = new NodeCache();
const { fundamental, trading } = rawstock

@prefix('/api')
export default class ApiController {
  @router({
    path: '/getStockBasics',
  })
  async getStockBasics(ctx: Koa.Context): Promise<void> {
    let stocks
    try{
      stocks = myCache.get('stocks');
      if (!stocks) {
        stocks = await fundamental.getStockBasics()
      }
    } catch( err ){
      stocks = await fundamental.getStockBasics()
    }
    if (stocks) {
      myCache.set('stocks', stocks);
    }
    ctx.body = {
      code: 0,
      data: stocks
    }
  }

  @router({
    path: '/getKDataFromBaidu',
  })
  async getKDataFromBaidu(ctx: Koa.Context): Promise<void> {
    const { code } = ctx.query
    const key = `kdata_${code}`
    const params = { code, count: 30 }
    let kData
    try{
      kData = myCache.get(key);
      if (!kData) {
        kData = await trading.getKDataFromBaidu(params)
        if (kData) {
          myCache.set(key, kData);
        }
      }
    } catch( err ){
      kData = await trading.getKDataFromBaidu(params)
      if (kData) {
        myCache.set(key, kData);
      }
    }
    ctx.body = {
      code: 0,
      data: kData
    }
  }
}