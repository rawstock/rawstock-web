// API
import Http from './http';

export default class API {
  apiPrefix = '/api/'
  http = new Http(this.apiPrefix);
  // 获取所有股票信息
  getStockBasics = () => this.http.Get('getStockBasics')
  // 根据代码获取股票信息
  getKDataFromBaidu = params => this.http.Get('getKDataFromBaidu', params)
}
