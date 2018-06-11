

import { Route } from './router/Route';
import config = require('config');

const route = new Route();
route.getDecoratedRouters(config.path.controllers);

export = route.router.routes()