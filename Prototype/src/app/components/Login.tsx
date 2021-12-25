import { createDispatcher, EventDispatcher } from 'event-dispatcher';
import Application from './Application';
import * as Matsuwa from 'matsuwa';
import Signup from './Signup';
import React from 'react';
import DOM from 'react-dom';

interface LoginState {
  clickedSignup: boolean;
  username: string | null;
  password: string | null;
  errored: boolean;
  logged: boolean;
  error: any;
}
export default class LoginComponent extends React.Component<{}, LoginState> {
  private dispatcher: EventDispatcher;

  constructor(props: any) {
    super(props);
    
    this.dispatcher = createDispatcher('user');
    this.state = {
      clickedSignup: false,
      username: null,
      password: null,
      errored: false,
      logged: false,
      error: null
    };

    this.addEvents();
  }

  private addEvents() {
    this.dispatcher.on('error', (pkt) => 
      this.setState({ errored: true, error: pkt })
    );
  }

  async login(event: React.FormEvent) {
    event.preventDefault();

    const http = new Matsuwa.http.HttpClient();
    log('info', `Logging as ${this.state.username}...`);

    const request = await http.post('https://api.kashima.app/accounts/login')
      .body({
        username: this.state.username,
        password: this.state.password
      }, 'json')
      .header({
        'Content-Type': 'application/json',
        Authorization: process.env.MASTER_KEY as string
      })
      .execute();

    const data = request.json();
    if (data.statusCode > 300) {
      log('error', 'Unable to login', data);
      this.dispatcher.emit('error', {
        message: data.message,
        code: data.statusCode
      });
    } else {
      // TODO: add a error boundary component
      const socket = await Matsuwa.ipc.getSocket();
      global.socket = socket;
      // @ts-ignore
      kashima.ipcPing = setInterval(() => {
        log('debug', 'Sent heartbeat!');
        socket.write(JSON.stringify({
          op: 'heartbeat'
        }));
      }, 30000);
  
      kashima.settings.set('username', this.state.username);
      kashima.settings.set('password', this.state.password);
  
      DOM.render(<Application />, document.getElementById('root'));
    }
  }

  onSignup(event: React.MouseEvent) {
    event.preventDefault();
    const el = document.getElementById('root');
    DOM.render(<Signup />, el);
  }

  onChangePassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ password: event.target.value });
  }

  onChangeUsername(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ username: event.target.value });
  }

  render() {
    return (
      <div>
        <h1 className='title'>Login</h1>
        <form onSubmit={this.login.bind(this)}>
          <p className='subtext'>Username</p>
          <br />
          <input type='text' placeholder='...username' onChange={this.onChangeUsername.bind(this)} />
          <br />
          <p className='subtext'>Password</p>
          <br />
          <input type='password' placeholder='...password' onChange={this.onChangePassword.bind(this)} />
          <br />
          <input type='submit' value='Submit' />
        </form>
        {this.state.error && <div className='error-box'>
          [{this.state.error.statusCode}]: {this.state.error.message}  
        </div>}

        <button onClick={this.onSignup.bind(this)} className='btn'>Sign Up</button>
      </div>
    );
  }
}