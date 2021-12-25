"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
class AudioListComponent extends react_1.default.Component {
    render() {
        return react_1.default.createElement("table", { className: 'audio-list' },
            react_1.default.createElement("tbody", null));
    }
}
exports.default = AudioListComponent;
