import { PropTypes, Component, createElement, Children } from 'react';
import { render } from 'react-dom';
import isPlainObject from 'is-plain-object';
import Horizon from '@horizon/client';

/**
 * Initializes connection to Horizon server and passes
 * hzConnected prop to enhanced component.
 */
export default class extends Component {
  static propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
    horizonProps: PropTypes.object,
    horizon: PropTypes.func,
    children: PropTypes.element.isRequired
  };

  static defaultProps = {
    horizonProps: {}
  };

  static childContextTypes = {
    horizon: PropTypes.func,
    store: PropTypes.object
  };

  getChildContext() {
    return {
      horizon: this.horizon,
      store: this.store
    };
  }

  constructor(props, context) {
    super(props, context);

    const initialState = {};

    // the horizon connection
    this.horizon = props.horizon
    ? props.horizon
    : Horizon(props.horizonProps);

    // the redux connection
    this.store = props.store;

    initialState.hzStatus = props.horizon
    ? props.horizon.status().getValue()
    : false;

    this.state = initialState;

    // set up connection status callbacks
    this.horizon.onDisconnected(this.onStatus);
    this.horizon.onReady(this.onStatus);
    this.horizon.onSocketError(this.onStatus);

    if (props.horizon) return;

    this.horizon.connect(this.onStatus);
  }

  onStatus = (status) => {
    this.setState({
      hzStatus: status
    });
  };

  render() {
    return this.state.hzStatus.type === 'ready'
    ? this.renderConnected()
    : this.renderLoading();
  }

  renderConnected() {
    return Children.only(this.props.children)
  }

  renderLoading() {
    return this.props.loadingComponent
    ? createElement(this.props.loadingComponent)
    : null;
  }
}
