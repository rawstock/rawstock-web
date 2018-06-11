import axios from 'axios';

export default class Http {
  apiPrefix: string
  constructor(apiPrefix: string) {
    this.apiPrefix = apiPrefix
  }
  Get(url: string, query?: any) {
    return axios.get(`${this.apiPrefix || ''}${url}`, { params: query, timeout: 5000 }).then(res => res.data);
  }
  Post(url: string, body: any, query?: any) {
    return axios.post(`${this.apiPrefix || ''}${url}`, body, { params: query, timeout: 5000 }).then(res => res.data);
  }
}