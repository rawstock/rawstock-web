
/* tslint:disable:no-console */
import * as React from 'react';
import {
  Table, InputNumber, Input, Button, message,
  Modal, Spin, Icon, Select, Card
} from 'antd';
import EchartsReact from '@client/views/H5/components/EchartsReact'
import Api from '@utils/api'
import './home.scss'

const { Option } = Select
const api = new Api()
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
const DAY = 6
// 初始净利润率
const DEFUAT_NPR = 6
// 初始每股收益
const DEFUAT_ESP = 0.05

interface HomeState {
  isDataLoading: boolean;
  isKDataLoading: boolean;
  isGoldenLoading: boolean;
  isPotentialLoading: boolean;
  canOperate: boolean;
  data: any;
  kData: any;
  filterData: any;
  goldenData: any;
  keyword: string;
  npr: number;
  esp: number;
  showMacdModal: boolean;
  selectedCode: string;
  lineOption: any;
  kOption: any;
  hasGoldenCross: boolean;
  currentIndustry: string;
  industryOption: any;
}

const upColor = '#ec0000';
const upBorderColor = '#8A0000';
const downColor = '#00da3c';
const downBorderColor = '#008F28';

export default class Home extends React.Component {
  public state: HomeState = {
    // 正在加载股票列表
    isDataLoading: false,
    // 正在加载K线数据
    isKDataLoading: false,
    // 正在处理金叉数据
    isGoldenLoading: false,
    // 正在处理潜在数据
    isPotentialLoading: false,
    // 是否可操作
    canOperate: false,
    // 股票列表数据
    data: [],
    // 股票k线数据
    kData: [],
    // 含金叉的股票k线数据
    goldenData: [],
    // 筛选后的股票列表数据
    filterData: [],
    // 所属行业选项
    industryOption: [],
    // 搜索关键词
    keyword: '',
    // 搜索净利润率
    npr: DEFUAT_NPR,
    // 搜索每股收益
    esp: DEFUAT_ESP,
    // 是否显示macd弹窗
    showMacdModal: false,
    // 当前点击的股票代码
    selectedCode: '',
    // macd数据
    lineOption: {},
    // k线数据
    kOption: {},
    // 是否含有金叉
    hasGoldenCross: false,
    // 当前所属行业
    currentIndustry: '全部'
  }
  private columns: any = []
  private currentIterator: any = null
  constructor(props) {
    super(props)
    this.columns = [
      {
        title: '代码',
        dataIndex: 'code',
        render: text => {
          return <div className="code" onClick={this.handleCodeClick(text)}>{text}<Spin indicator={antIcon} spinning={this.state.isKDataLoading && this.state.selectedCode === text} /></div>
        }
      }, {
        title: '名称',
        dataIndex: 'name',
      }, {
        title: '所属行业',
        dataIndex: 'industry',
      }, {
        title: '市盈率',
        dataIndex: 'pe',
      }, {
        title: '流通股本(亿)',
        dataIndex: 'outstanding',
      }, {
        title: '总股本(亿)',
        dataIndex: 'totals',
      }, {
        title: '每股收益',
        dataIndex: 'esp',
      }, {
        title: '净利润率',
        dataIndex: 'npr',
      }
    ];
  }
  componentDidMount() {
    this.loadData()
  }
  loadData() {
    if (this.state.isDataLoading) {
      return;
    }
    this.setState({ isDataLoading: true })
    api.getStockBasics().then(res => {
      if (res.code === 0) {
        this.setIndustryOption(res.data)
        this.setState({
          data: res.data,
          filterData: res.data
        })
      }
      this.setState({ isDataLoading: false })
    }).catch(() => {
      this.setState({ isDataLoading: false })
    })
  }
  setIndustryOption(data) {
    const industryOption = []
    if (data && data.length > 0) {
      data.forEach(d => {
        if (!industryOption.includes(d.industry)) {
          industryOption.push(d.industry)
        }
      });
    }
    this.setState({ industryOption })
  }
  loadKData(code) {
    if (this.state.isKDataLoading) {
      return;
    }
    this.setState({ isKDataLoading: true, selectedCode: code })
    api.getKDataFromBaidu({ code }).then(res => {
      if (res.code === 0) {
        const kData = res.data ? res.data.mashData || [] : []
        this.setState({
          kData
        }, () => {
          this.getMacdLineOption(kData)
          const hasGoldenCross = this.checkHasGoldenCross(kData, DAY)
          this.setState({ hasGoldenCross })
        })
        // console.log('res', res);
      }
      this.setState({ isKDataLoading: false, showMacdModal: true })
    }).catch(() => {
      this.setState({ isKDataLoading: false })
    })
  }
  getMacdLineOption = kData => {
    const rKData = kData.sort((r1, r2) => r1.date - r2.date)
    const xAxisData = rKData.map(k => k.date)
    const seriesDeaData = rKData.map(k => k.macd.dea)
    const seriesDiffData = rKData.map(k => k.macd.diff)
    const seriesMacdData = rKData.map(k => k.macd.macd)
    const splitData = rawData => {
      const categoryData = [];
      const values = []
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i])
      }
      return {
        categoryData,
        values
      };
    }
    const seriesKData = splitData(rKData.map(k =>
      [k.date, k.kline.open, k.kline.close, k.kline.low, k.kline.high]))
    const kOption = {
      title: {
        text: 'k线',
        left: 0
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30']
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: seriesKData.categoryData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          y: '90%',
          start: 50,
          end: 100
        }
      ],
      series: [
        {
          name: '日K',
          type: 'candlestick',
          data: seriesKData.values,
          itemStyle: {
            normal: {
              color: upColor,
              color0: downColor,
              borderColor: upBorderColor,
              borderColor0: downBorderColor
            }
          },
          markPoint: {
            label: {
              normal: {
                formatter(param) {
                  return param !== null ? Math.round(param.value) : '';
                }
              }
            },
            data: [
              {
                name: 'XX标点',
                coord: ['2013/5/31', 2300],
                value: 2300,
                itemStyle: {
                  normal: { color: 'rgb(41,60,85)' }
                }
              },
              {
                name: 'highest value',
                type: 'max',
                valueDim: 'highest'
              },
              {
                name: 'lowest value',
                type: 'min',
                valueDim: 'lowest'
              },
              {
                name: 'average value on close',
                type: 'average',
                valueDim: 'close'
              }
            ],
            tooltip: {
              formatter(param) {
                return param.name + '<br>' + (param.data.coord || '');
              }
            }
          },
          markLine: {
            symbol: ['none', 'none'],
            data: [
              [
                {
                  name: 'from lowest to highest',
                  type: 'min',
                  valueDim: 'lowest',
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    normal: { show: false },
                    emphasis: { show: false }
                  }
                },
                {
                  type: 'max',
                  valueDim: 'highest',
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    normal: { show: false },
                    emphasis: { show: false }
                  }
                }
              ],
              {
                name: 'min line on close',
                type: 'min',
                valueDim: 'close'
              },
              {
                name: 'max line on close',
                type: 'max',
                valueDim: 'close'
              }
            ]
          }
        }
      ]
    }
    const lineOption = {
      title: {
        text: 'MACD'
      },
      legend: {
        data: ['dea', 'diff', 'macd']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'dea',
          stack: 'dea',
          type: 'line',
          data: seriesDeaData,
          color: ['#ff71FB']
        },
        {
          name: 'diff',
          stack: 'diff',
          type: 'line',
          data: seriesDiffData,
          color: ['#5971FB']
        },
        {
          name: 'macd',
          type: 'bar',
          data: seriesMacdData,
          color: ['#59ff59']
        }
      ],
    };
    this.setState({ lineOption, kOption })
  }
  // 点击股票代码加载K线数据
  handleCodeClick = code => {
    return () => {
      this.loadKData(code)
    }
  }
  // 关键词改变
  handleKeywordChange = e => {
    const keyword = e.target.value
    this.setState({ keyword })
  }
  // 净利润率改变
  handleNPRChange = value => {
    const npr = value
    if (npr === '' || npr === undefined) {
      this.setState({ npr: null })
    } else {
      this.setState({ npr: +npr })
    }
  }
  // 每股收益改变
  handleESPChange = value => {
    const esp = value
    if (esp === '' || esp === undefined) {
      this.setState({ esp: null })
    } else {
      this.setState({ esp: +esp })
    }
  }
  // 所属行业改变
  handleIndustryChange = value => {
    console.log(`selected ${value}`);
    this.setState({ currentIndustry: value })
  }
  // 搜索
  handleSearch = () => {
    const { data, keyword, npr, esp, currentIndustry } = this.state
    let filterData = data.filter(d => d.name.includes(keyword))
    if (npr !== null) {
      filterData = filterData.filter(d => d.npr > npr)
    }
    if (esp !== null) {
      filterData = filterData.filter(d => d.esp > esp)
    }
    if (currentIndustry !== null && currentIndustry !== '全部') {
      filterData = filterData.filter(d => d.industry === currentIndustry)
    }
    this.setState({
      filterData,
      goldenData: []
    })
  }
  // 过滤含有金叉的股票
  handleGoldenCrossSearch = () => {
    const { filterData, isGoldenLoading } = this.state
    if (isGoldenLoading) {
      return
    }
    this.currentIterator = filterData[Symbol.iterator]()
    this.setState({ goldenData: [], isGoldenLoading: true, canOperate: true }, () => {
      this.startGoldenCrossSearch()
    })
  }
  // 开始查找金叉股
  startGoldenCrossSearch() {
    const { goldenData, canOperate } = this.state
    const stock = this.currentIterator.next().value
    if (stock && canOperate) {
      api.getKDataFromBaidu({ code: stock.code }).then(res => {
        if (res.code === 0) {
          const kData = res.data ? res.data.mashData || [] : []
          const hasGoldenCross = this.checkHasGoldenCross(kData, DAY)
          console.log(`${stock.code} ${stock.name} ${hasGoldenCross ? '' : '不'}含有金叉`)
          if (hasGoldenCross) {
            goldenData.push(stock)
            this.setState({ goldenData })
          }
        }
      }).finally(() => {
        setTimeout(() => {
          this.startGoldenCrossSearch()
        }, 2000)
      })
    } else {
      message.success('过滤金叉股完毕')
      this.setState({ isGoldenLoading: false })
    }
  }
  // 过滤含有潜力的股票
  handlePotentialStockSearch = () => {
    const { filterData, isPotentialLoading } = this.state
    if (isPotentialLoading) {
      return
    }
    this.currentIterator = filterData[Symbol.iterator]()
    this.setState({ goldenData: [], isPotentialLoading: true, canOperate: true }, () => {
      this.startPotentialStockSearch()
    })
  }
  // 开始查找金叉股
  startPotentialStockSearch() {
    const { goldenData, canOperate } = this.state
    const stock = this.currentIterator.next().value
    if (stock && canOperate) {
      api.getKDataFromBaidu({ code: stock.code }).then(res => {
        if (res.code === 0) {
          const kData = res.data ? res.data.mashData || [] : []
          const hasPotential = this.checkHasPotential(kData)
          console.log(`${stock.code} ${stock.name} ${hasPotential ? '' : '没'}有潜力`)
          if (hasPotential) {
            goldenData.push(stock)
            this.setState({ goldenData })
          }
        }
      }).finally(() => {
        setTimeout(() => {
          this.startPotentialStockSearch()
        }, 2000)
      })
    } else {
      message.success('过滤潜在股完毕')
      this.setState({ isPotentialLoading: false })
    }
  }
  // 校验该股是否在day内有金叉
  checkHasGoldenCross(kData, day) {
    if (!(kData && kData.length > 0)) {
      console.log('无k线数据')
      return false
    }
    const rKData = kData
    let isGoodCode = false
    let isGoldenCross = false
    // console.log('rKData0', rKData);

    const dea1 = rKData[0].macd.dea
    const diff1 = rKData[0].macd.diff
    if (diff1 > dea1) {
      // console.log('diff1 > dea1', rKData[0].date, diff1, dea1);
      isGoodCode = true
    }
    if (isGoodCode) {
      for (let i = 1; i < day; i++) {
        const dea = rKData[i].macd.dea
        const diff = rKData[i].macd.diff
        if (diff <= dea) {
          // console.log('diff <= dea', rKData[i].date, diff, dea);
          isGoldenCross = true
          break
        }
      }
    }
    return isGoldenCross
  }
  // 校验该股是否有潜力
  checkHasPotential(kData) {
    if (!(kData && kData.length > 0)) {
      console.log('无k线数据')
      return false
    }
    const rKData = kData
    let isGoodCode = false
    // console.log('rKData0', rKData);
    if (rKData.length < 2) {
      console.log('k线数据不足')
      return false
    }
    const dea1 = rKData[0].macd.dea
    const diff1 = rKData[0].macd.diff
    const dea2 = rKData[1].macd.dea
    const diff2 = rKData[1].macd.diff
    const difference1 = dea1 - diff1
    const difference2 = dea2 - diff2
    const ratio = difference1 / difference2
    const threshold = 0.9
    if (diff1 < dea1 &&
      diff2 < dea2 &&
      difference1 < difference2 &&
      ratio < threshold) {
      console.log('goodCode', diff1, dea1, diff2, dea2, difference1, difference2, ratio);
      isGoodCode = true
    }
    return isGoodCode
  }
  handleCanelOperate = () => {
    this.setState({
      canOperate: false
    }, () => {
      message.success('操作已取消')
    })
  }
  render() {
    const { filterData, isDataLoading, isGoldenLoading, lineOption, industryOption,
      kOption, hasGoldenCross, goldenData, isPotentialLoading } = this.state
    const dataSource = goldenData.length > 0 ? goldenData : filterData
    const canDisable = !isGoldenLoading && !isPotentialLoading
    return (
      <div className="search-panel">
        <Card>
          <div className="row search-form">
            <div className="col">
              股票名称：
              <Input className="name" onChange={this.handleKeywordChange} />
            </div>
            <div className="col">
              净利润率大于：
              <InputNumber defaultValue={DEFUAT_NPR} className="npr" onChange={this.handleNPRChange} />
            </div>
            <div className="col">
              每股收益大于：
              <InputNumber defaultValue={DEFUAT_ESP} className="esp" step={0.01} onChange={this.handleESPChange} />
            </div>
            <div className="col">
              所属行业：
              <Select className="industry" defaultValue="全部" style={{ width: 100 }} onChange={this.handleIndustryChange}>
                <Option value="全部">全部</Option>
                {
                  industryOption.map(i => <Option key={i} value={i}>{i}</Option>)
                }
              </Select>
            </div>
          </div>
          <div className="row btns">
            <Button type="primary" onClick={this.handleSearch}>搜索</Button>
            <Button loading={isGoldenLoading} onClick={this.handleGoldenCrossSearch}>过滤金叉股</Button>
            <Button loading={isPotentialLoading} onClick={this.handlePotentialStockSearch}>过滤潜在股</Button>
            <Button disabled={canDisable} onClick={this.handleCanelOperate}>取消当前操作</Button>
          </div>
          <Table rowKey="code" loading={isDataLoading} columns={this.columns} dataSource={dataSource} />
        </Card>
        <Modal
          title="macd"
          visible={this.state.showMacdModal}
          onCancel={() => {
            this.setState({ showMacdModal: false })
          }}
          footer={null}
        >
          <div>{DAY}天内是否含有金叉：{hasGoldenCross ? <span className="green">是</span> : <span className="red">否</span>}</div>
          <EchartsReact option={kOption} />
          <EchartsReact option={lineOption} />
        </Modal>
      </div>

    );
  }
}
