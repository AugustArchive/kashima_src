"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const event_dispatcher_1 = require("event-dispatcher");
const react_1 = __importDefault(require("react"));
class SongComponent extends react_1.default.Component {
    get song() {
        return this.props.song;
    }
    onPlay(event, id) {
        event.preventDefault();
        event_dispatcher_1.dispatchEvent('player', 'play', id);
    }
    render() {
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("tr", { className: 'cell' },
                react_1.default.createElement("td", { className: 'cell-text' },
                    react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: 'play-circle', style: { cursor: 'pointer' }, onClick: event => this.onPlay(event, this.song.id) })),
                react_1.default.createElement("td", { className: 'cell-text' },
                    react_1.default.createElement("p", { className: 'cell-text-markup' }, this.song.artist)),
                react_1.default.createElement("td", { className: 'cell-text' },
                    react_1.default.createElement("p", { className: 'cell-text-markup' }, this.song.title)),
                react_1.default.createElement("td", { className: 'cell-text' },
                    react_1.default.createElement("p", { className: 'cell-text-markup' }, this.song.duration))));
    }
}
exports.default = SongComponent;
