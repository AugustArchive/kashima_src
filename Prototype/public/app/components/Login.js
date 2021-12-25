"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_dispatcher_1 = require("event-dispatcher");
const Application_1 = __importDefault(require("./Application"));
const Matsuwa = __importStar(require("matsuwa"));
const Signup_1 = __importDefault(require("./Signup"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
class LoginComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.dispatcher = event_dispatcher_1.createDispatcher('user');
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
    addEvents() {
        this.dispatcher.on('error', (pkt) => this.setState({ errored: true, error: pkt }));
    }
    async login(event) {
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
            Authorization: process.env.MASTER_KEY
        })
            .execute();
        const data = request.json();
        if (data.statusCode > 300) {
            log('error', 'Unable to login', data);
            this.dispatcher.emit('error', {
                message: data.message,
                code: data.statusCode
            });
        }
        else {
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
            react_dom_1.default.render(react_1.default.createElement(Application_1.default, null), document.getElementById('root'));
        }
    }
    onSignup(event) {
        event.preventDefault();
        const el = document.getElementById('root');
        react_dom_1.default.render(react_1.default.createElement(Signup_1.default, null), el);
    }
    onChangePassword(event) {
        this.setState({ password: event.target.value });
    }
    onChangeUsername(event) {
        this.setState({ username: event.target.value });
    }
    render() {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h1", { className: 'title' }, "Login"),
            react_1.default.createElement("form", { onSubmit: this.login.bind(this) },
                react_1.default.createElement("p", { className: 'subtext' }, "Username"),
                react_1.default.createElement("br", null),
                react_1.default.createElement("input", { type: 'text', placeholder: '...username', onChange: this.onChangeUsername.bind(this) }),
                react_1.default.createElement("br", null),
                react_1.default.createElement("p", { className: 'subtext' }, "Password"),
                react_1.default.createElement("br", null),
                react_1.default.createElement("input", { type: 'password', placeholder: '...password', onChange: this.onChangePassword.bind(this) }),
                react_1.default.createElement("br", null),
                react_1.default.createElement("input", { type: 'submit', value: 'Submit' })),
            this.state.error && react_1.default.createElement("div", { className: 'error-box' },
                "[",
                this.state.error.statusCode,
                "]: ",
                this.state.error.message),
            react_1.default.createElement("button", { onClick: this.onSignup.bind(this), className: 'btn' }, "Sign Up")));
    }
}
exports.default = LoginComponent;
