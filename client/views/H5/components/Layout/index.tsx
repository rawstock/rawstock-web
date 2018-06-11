import * as React from 'react';
import { Link } from 'react-router-dom'
import { Layout, Menu, Icon } from 'antd';
import '@client/views/H5/styles/common.scss';
const { Content, Footer, Sider } = Layout;

class CustomLayout extends React.Component {
  render() {
    return (
      <Layout>
        <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Link className="item" to={'home'}>
                <Icon type="bar-chart" />
                <span className="nav-text">首页</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link className="item" to={'note'}>
                <Icon type="book" />
                <span className="nav-text">财报笔记</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: 200 }}>
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            {this.props.children}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            RawStock-Web ©2018 Created by FEYeh.
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

export default CustomLayout