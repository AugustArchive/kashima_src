"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const event_dispatcher_1 = require("event-dispatcher");
const react_1 = __importDefault(require("react"));
class AudioControllerComponent extends react_1.default.Component {
    onPlay(event) {
        event.preventDefault();
        log('info', 'Playing the first song...');
        event_dispatcher_1.dispatchEvent('player', 'play');
    }
    onRepeatState(event) {
        event.preventDefault();
        log('info', 'Setting repeat toggle state...');
        event_dispatcher_1.dispatchEvent('player', 'repeat');
    }
    onShuffleState(event) {
        event.preventDefault();
        log('info', 'Setting shuffle toggle state...');
        event_dispatcher_1.dispatchEvent('player', 'shuffle');
    }
    onForward(event) {
        event.preventDefault();
        log('info', 'Skipping to the next song...');
        event_dispatcher_1.dispatchEvent('player', 'forward');
    }
    onBackward(event) {
        event.preventDefault();
        log('info', 'Skipping to the previous song...');
        event_dispatcher_1.dispatchEvent('player', 'backward');
    }
    onSliderVelocity() {
        const slider = document.getElementById('vol-slider');
        slider.oninput = function onSliderInput() {
            // this is any because the this context is the global event emitter
            event_dispatcher_1.dispatchEvent('player', 'volume', this.value);
            kashima.settings.set('volume', this.value);
        };
    }
    componentDidMount() {
        // Do the slider function when this component has mounted to the browser
        this.onSliderVelocity();
    }
    render() {
        const value = kashima.settings.get('volume', 50);
        // All of the elements have an ID so, when it's enabled, it'll show
        // a greenish color on the icon to indicate it's enabled
        // otherwise, remove the CSS element when it's disabled
        return (react_1.default.createElement("div", { className: 'controller' },
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { id: 'shuffle', icon: 'random', style: { cursor: 'pointer' }, onClick: this.onShuffleState.bind(this) }),
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: 'backward', style: { cursor: 'pointer' }, onClick: this.onBackward.bind(this) }),
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { id: 'play', icon: 'play-circle', style: { cursor: 'pointer' }, onClick: this.onPlay.bind(this) }),
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: 'forward', style: { cursor: 'pointer' }, onClick: this.onForward.bind(this) }),
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { id: 'repeat', icon: 'repeat', style: { cursor: 'pointer' }, onClick: this.onRepeatState.bind(this) }),
            react_1.default.createElement("div", { className: 'controller-end' },
                react_1.default.createElement("input", { id: 'vol-slider', className: 'slider', type: 'range', value: value, min: '1', max: '100' })),
            react_1.default.createElement("br", null),
            react_1.default.createElement("span", { id: 'artist', className: 'controller-title' }),
            " ",
            react_1.default.createElement("span", { id: 'title', className: 'controller-title' })));
    }
}
exports.default = AudioControllerComponent;
