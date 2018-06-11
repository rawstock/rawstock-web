// polyfill
require('core-js/shim');

// 用于引用不常用的库文件
require('expose-loader?React!react');
require('expose-loader?ReactDOM!react-dom');
require('react-router-dom');
require('moment');
require('classnames');
require('prop-types');
