import matsuwa from 'matsuwa';
import Login from './Login';
import React from 'react';
import DOM from 'react-dom';

interface SignupState {
  username: string | null;
  password: string | null;
  errored: boolean;
  email: string | null;
  error: any;
}
export default class SignupComponent extends React.Component<{}, SignupState> {
  private http: matsuwa.http.HttpClient;

  constructor(props: any) {
    super(props);
    
    this.http = new matsuwa.http.HttpClient();
    this.state = {
      username: null,
      password: null,
      errored: false,
      email: null,
      error: 1
    };
  }

  onChangePassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ password: event.target.value });
  }

  onChangeUsername(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ username: event.target.value });
  }

  onChangeEmail(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ email: event.target.value });
  }

  async signup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const req = await this.http.put('https://api.kashima.app/accounts', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.MASTER_KEY!
      },
      data: {
        username: this.state.username,
        password: this.state.password,
        email: this.state.email
      }
    }).execute();

    const data = req.json();
    if (!req.successful) this.setState({ errored: true, error: data });
    else DOM.render(<Login />, document.getElementById('app'));
  }

  render() {
    return (
      <div>
        <h1 className='title'>Signup</h1>
        <form onSubmit={this.signup.bind(this)}>
          <p className='subtext'>Username</p>
          <br />
          <input type='text' placeholder='...username' onChange={this.onChangeUsername.bind(this)} />
          <br />
          <p className='subtext'>Password</p>
          <br />
          <input type='password' placeholder='...password' onChange={this.onChangePassword.bind(this)} />
          <br />
          <input type='text' placeholder='...email' onChange={this.onChangeEmail.bind(this)} />
          <br />
          <input type='submit' value='Submit' id='in' />
        </form>
        {this.state.errored && 
          <div className='error-box'>
            [{this.state.error.statusCode}]: {this.state.error.message}
          </div>
        }
      </div>
    );
  }
}