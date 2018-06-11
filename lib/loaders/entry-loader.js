const loaderUtils = require('loader-utils');
const anymatch = require('anymatch');

module.exports = function(source) {
  return source;
};

module.exports.pitch = function(request) {
  const { entry = [] } = loaderUtils.getOptions(this);
  const matcher = anymatch(entry);
  if (matcher(this.resourcePath)) {
    const r = loaderUtils.stringifyRequest(this, '!!' + request);

    if (process.env.NODE_ENV === 'production') {
      return `
        var ReactDOM = require('react-dom');
        var React = require('react');
        var r = require(${r});
        var App = 'default' in r ? r['default'] : r;
        var appState = window._appState ? window._appState : {};

        ReactDOM.render(React.createElement(App, {
          appState: appState
        }), document.getElementById('app'));
      `;
    }

    return `
      var AppContainer = require('react-hot-loader').AppContainer;
      var ReactDOM = require('react-dom');
      var React = require('react');
      var r = require(${r});
      var App = 'default' in r ? r['default'] : r;
      var appState = window._appState ? window._appState : {};

      function render(Component) {
        ReactDOM.render(
          React.createElement(
            AppContainer,
            null,
            React.createElement(Component, {
              appState: appState
            })
          ), document.getElementById('app')
        );
      }

      render(App);

      if (module.hot) {
        module.hot.accept(${r}, function () {
          var r = require(${r});
          var NextApp = 'default' in r ? r['default'] : r;
          render(NextApp);
        });
      }
    `;
  }

  return;
};
