"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_dom_1 = require("react-dom");
const react_1 = __importDefault(require("react"));
// @ts-ignore
const Main_1 = __importDefault(require("./app/pages/Main"));
const el = document.getElementById('root');
react_dom_1.render(react_1.default.createElement(Main_1.default, null), el);
