import getToken from './getToken';
import React from 'react';

const getDisplayName = (component) => component.getDisplayName || component.name || 'RawComponent';

/**
 * Checks for authenication
 * @param {React.Component | JSX.Element} WrappedComponent The wrapped component
 * @returns {React.Component} A component-esk class of the wrapped component with the auth component
 */
export default function withAuth(WrappedComponent) {
  return (class extends React.Component {
    static displayName = `withAuth(${getDisplayName(WrappedComponent)})`;
    static async getInitialProps(context) {
      const token = getToken(context);
      const props = WrappedComponent.getInitialProps && (await WrappedComponent.getInitialProps());
      return { ...props, token };
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  });
}