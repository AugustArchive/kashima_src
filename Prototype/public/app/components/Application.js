"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_dispatcher_1 = require("event-dispatcher");
const fs_1 = require("fs");
const Song_1 = __importDefault(require("./Song"));
const music_metadata_1 = require("music-metadata");
const AudioList_1 = __importDefault(require("./AudioList"));
const path_1 = require("path");
const react_1 = __importDefault(require("react"));
let audio;
class ApplicationComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.dispatcher = event_dispatcher_1.createDispatcher('player');
        this.state = {
            currentSong: null,
            shuffle: false,
            volume: 100,
            songs: [],
            loop: false,
            id: 0
        };
    }
    loadSongs() {
        const directories = kashima.settings.get('directories');
        log('info', `Loading ${directories.length} directories...`);
        const songs = [];
        for (const directory of directories) {
            fs_1.promises.readdir(directory)
                .then(files => {
                log('info', `Found ${files.length} files! {colors:green:Now loading...}`);
                for (const file of files)
                    music_metadata_1.parseFile(path_1.join(directory, file), { duration: true })
                        .then(metadata => {
                        log('info', `Parsed metadata for ${metadata.common.artist || 'Unknown Artist'} - ${metadata.common.title || 'Unknown Title'}`);
                        songs.push({
                            directory,
                            duration: metadata.format.duration / 1000,
                            filename: file,
                            artist: metadata.common.artist || 'Unknown Artist',
                            title: metadata.common.title || 'Unknown Title',
                            album: metadata.common.album,
                            id: files.indexOf(file)
                        });
                    });
            });
        }
        this.setState({ songs });
    }
    componentDidMount() {
        this.loadSongs();
        this.addEvents();
    }
    addEvents() {
        this.dispatcher.on('play', (id) => id ? this.play(id) : this.handleAudio());
        this.dispatcher.on('pause', () => this.handleAudio());
        this.dispatcher.on('forward', () => this.handlePrevNext());
        this.dispatcher.on('backward', () => this.handlePrevNext(false));
        this.dispatcher.on('repeat', () => {
            const value = !this.state.loop;
            this.setState({ loop: value });
        });
        this.dispatcher.on('shuffle', () => {
            const value = !this.state.shuffle;
            this.setState({ shuffle: value });
        });
        this.dispatcher.on('volume', (value) => {
            audio.volume = value / 100;
            this.setState({ volume: value / 100 });
        });
    }
    handleAudio() {
        if (!audio)
            return this.play(0);
        if (audio.paused) {
            audio.play();
            event_dispatcher_1.dispatchEvent('global', 'playing', this.state.songs[this.state.id]);
        }
        else {
            audio.pause();
            event_dispatcher_1.dispatchEvent('global', 'main');
        }
    }
    play(index) {
        if (audio)
            audio.pause();
        const song = this.state.songs[index];
        audio = new Audio(`${song.directory}${path_1.sep}${song.filename}`);
        audio.setAttribute('index', index.toString());
        this.setState({ currentSong: song });
        audio.addEventListener('ended', () => {
            if (this.state.loop)
                return this.play(song.id);
            else if (this.state.shuffle) {
                const _song = this.state.songs[Math.floor(Math.random() * this.state.songs.length - 1)];
                return this.play(_song.id);
            }
            else {
                const i = index >= this.state.songs.length - 1 ? 0 : index + 1;
                return this.play(i);
            }
        });
        event_dispatcher_1.dispatchEvent('global', 'playing', song);
        document.getElementById('artist').innerHTML = song.artist;
        document.getElementById('title').innerHTML = song.title;
        audio.play();
    }
    handlePrevNext(forward = true) {
        const current = Number(audio.getAttribute('index'));
        let index;
        if (forward) {
            index = this.state.shuffle ? this.state.songs[Math.floor(Math.random() * this.state.songs.length)].id : current >= this.state.songs.length - 1 ? 0 : current + 1;
        }
        else {
            index = current <= 0 ? 1 : current + 1;
        }
        this.play(index);
    }
    render() {
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("h1", null, "Player Testing"),
            react_1.default.createElement("hr", null),
            react_1.default.createElement(AudioList_1.default, { songs: this.state.songs.map(s => react_1.default.createElement(Song_1.default, { song: s })) }));
    }
}
exports.default = ApplicationComponent;
