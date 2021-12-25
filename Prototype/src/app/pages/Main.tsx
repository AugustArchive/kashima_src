import Application from '../components/Application';
import * as matsuwa from 'matsuwa';
import Login from '../components/Login';
import React from 'react';

interface MainPageState {
  showLogin: boolean;
}
export default class MainPage extends React.Component<{}, MainPageState> {
  constructor(props: {}) {
    super(props);

    this.state = { showLogin: false };
  }

  async componentDidMount() {
    const value = kashima.settings.get('username', '') === '' || kashima.settings.get('password', '') === '';
    if (!value) {
      // TODO: add a error boundary component
      const socket = await matsuwa.ipc.getSocket();
      global.socket = socket;
      // @ts-ignore
      kashima.ipcPing = setInterval(() => {
        log('debug', 'Sent heartbeat!');
        socket.write(JSON.stringify({
          op: 'heartbeat'
        }));
      }, 30000);
    }
    
    this.setState({ showLogin: value });
  }

  render() {
    return this.state.showLogin ? <Login /> : <Application />;
  }
}