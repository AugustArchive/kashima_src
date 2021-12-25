"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const matsuwa_1 = __importDefault(require("matsuwa"));
const Login_1 = __importDefault(require("./Login"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
class SignupComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.http = new matsuwa_1.default.http.HttpClient();
        this.state = {
            username: null,
            password: null,
            errored: false,
            email: null,
            error: 1
        };
    }
    onChangePassword(event) {
        this.setState({ password: event.target.value });
    }
    onChangeUsername(event) {
        this.setState({ username: event.target.value });
    }
    onChangeEmail(event) {
        this.setState({ email: event.target.value });
    }
    async signup(event) {
        event.preventDefault();
        const req = await this.http.put('https://api.kashima.app/accounts', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: process.env.MASTER_KEY
            },
            data: {
                username: this.state.username,
                password: this.state.password,
                email: this.state.email
            }
        }).execute();
        const data = req.json();
        if (!req.successful)
            this.setState({ errored: true, error: data });
        else
            react_dom_1.default.render(react_1.default.createElement(Login_1.default, null), document.getElementById('app'));
    }
    render() {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h1", { className: 'title' }, "Signup"),
            react_1.default.createElement("form", { onSubmit: this.signup.bind(this) },
                react_1.default.createElement("p", { className: 'subtext' }, "Username"),
                react_1.default.createElement("br", null),
                react_1.default.createElement("input", { type: 'text', placeholder: '...username', onChange: this.onChangeUsername.bind(this) }),
                react_1.default.createElement("br", null),
                react_1.default.createElement("p", { className: 'subtext' }, "Password"),
                react_1.default.createElement("br", null),
                react_1.default.createElement("input", { type: 'password', placeholder: '...password', onChange: this.onChangePassword.bind(this) }),
                react_1.default.createElement("br", null),
                react_1.default.createElement("input", { type: 'text', placeholder: '...email', onChange: this.onChangeEmail.bind(this) }),
                react_1.default.createElement("br", null),
                react_1.default.createElement("input", { type: 'submit', value: 'Submit', id: 'in' })),
            this.state.errored &&
                react_1.default.createElement("div", { className: 'error-box' },
                    "[",
                    this.state.error.statusCode,
                    "]: ",
                    this.state.error.message)));
    }
}
exports.default = SignupComponent;
