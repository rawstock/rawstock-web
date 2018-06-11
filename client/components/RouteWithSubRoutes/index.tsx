import React = require('react');
import { Route } from 'react-router-dom';

export interface Props {
  path: string;
  // tslint:disable-next-line:no-any
  component: any;
  exact?: boolean;
  routes?: Props;
  needAuth?: boolean;
}

const RouteWithSubRoutes = (route: Props) => (
  <Route
    path={route.path}
    exact={route.exact}
    render={props => {
      return (
        <div id="main">
          <route.component {...props} routes={route.routes} />
        </div>
      )
    }}
  />
);

export default RouteWithSubRoutes;
