import React = require('react');
import PropTypes = require('prop-types');

type ReactNode = React.ReactNode;
export interface ProviderProps {
  store?: object;
  children?: ReactNode;
}

export default class Provider extends React.Component<ProviderProps, {}> {
  static propTypes = {
    store: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = {
    store: PropTypes.object,
  };
  // tslint:disable-next-line:no-any
  constructor(props: ProviderProps, context: any) {
    super(props, context);
  }

  getChildContext() {
    return {
      store: this.props.store,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
