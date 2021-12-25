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
const Application_1 = __importDefault(require("../components/Application"));
const matsuwa = __importStar(require("matsuwa"));
const Login_1 = __importDefault(require("../components/Login"));
const react_1 = __importDefault(require("react"));
class MainPage extends react_1.default.Component {
    constructor(props) {
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
        return this.state.showLogin ? react_1.default.createElement(Login_1.default, null) : react_1.default.createElement(Application_1.default, null);
    }
}
exports.default = MainPage;
