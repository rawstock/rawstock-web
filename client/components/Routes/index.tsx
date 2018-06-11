import React = require('react');
import { Switch, BrowserRouter as Router, Redirect } from 'react-router-dom';
import RouteWithSubRoutes from '../RouteWithSubRoutes/';
import Home from '@client/views/H5/pages/stock/home.tsx';
import Note from '@client/views/H5/pages/stock/note.tsx';
import Layout from '@client/views/H5/components/Layout'

const routes = [
  {
    path: '/home',
    component: Home,
  },
  {
    path: '/note',
    component: Note,
  },
];

export default () => (
  <Router>
    <Layout>
      <Switch>
        {routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
        <Redirect from="/" to="/home" />
      </Switch>
    </Layout>
  </Router>
);
