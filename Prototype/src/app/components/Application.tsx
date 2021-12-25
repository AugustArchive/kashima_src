import { createDispatcher, EventDispatcher, dispatchEvent } from 'event-dispatcher';
import { promises as fs } from 'fs';
import AudioController from './AudioController';
import SongComponent from './Song';
import { parseFile } from 'music-metadata';
import AudioList from './AudioList';
import { join, sep } from 'path';
import React from 'react';

interface Song {
  /** The song's directory */
  directory: string;

  /**
   * The end duration
   */
  duration: number;

  /** The file name of the file */
  filename: string;

  /**
   * The artist of the song
   */
  artist: string;

  /**
   * The album of the song
   */
  album?: string;

  /**
   * The title of the song
   */
  title: string;

  /**
   * The song index to find in the Array
   */
  id: number;
}

interface ApplicationState {
  currentSong: Song | null;
  shuffle: boolean;
  volume: number;
  songs: Song[];
  loop: boolean;
  id: number;
}

let audio!: HTMLAudioElement;
export default class ApplicationComponent extends React.Component<{}, ApplicationState> {
  private dispatcher: EventDispatcher;

  constructor(props: Readonly<{}>) {
    super(props);

    this.dispatcher = createDispatcher('player');
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
    const directories = kashima.settings.get<string[]>('directories')!;
    log('info', `Loading ${directories.length} directories...`);

    const songs: Song[] = [];
    for (const directory of directories) {
      fs.readdir(directory)
        .then(files => {
          log('info', `Found ${files.length} files! {colors:green:Now loading...}`);
          for (const file of files) parseFile(join(directory, file), { duration: true })
            .then(metadata => {
              log('info', `Parsed metadata for ${metadata.common.artist || 'Unknown Artist'} - ${metadata.common.title || 'Unknown Title'}`);
              songs.push({
                directory,
                duration: metadata.format.duration! / 1000,
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

  private addEvents() {
    this.dispatcher.on('play', (id?: number) => id ? this.play(id) : this.handleAudio());
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

    this.dispatcher.on('volume', (value: number) => {
      audio.volume = value / 100;
      this.setState({ volume: value / 100 });
    });
  }

  handleAudio() {
    if (!audio) return this.play(0);
    if (audio.paused) {
      audio.play();
      dispatchEvent('global', 'playing', this.state.songs[this.state.id]);
    } else {
      audio.pause();
      dispatchEvent('global', 'main');
    }
  }

  play(index: number) {
    if (audio) audio.pause();

    const song = this.state.songs[index];
    audio = new Audio(`${song.directory}${sep}${song.filename}`);
    audio.setAttribute('index', index.toString());
    this.setState({ currentSong: song });

    audio.addEventListener('ended', () => {
      if (this.state.loop) return this.play(song.id);
      else if (this.state.shuffle) {
        const _song = this.state.songs[Math.floor(Math.random() * this.state.songs.length - 1)];
        return this.play(_song.id);
      } else {
        const i = index >= this.state.songs.length - 1 ? 0 : index + 1;
        return this.play(i);
      }
    });

    dispatchEvent('global', 'playing', song);
    document.getElementById('artist')!.innerHTML = song.artist;
    document.getElementById('title')!.innerHTML = song.title;

    audio.play();
  }

  handlePrevNext(forward: boolean = true) {
    const current = Number(audio.getAttribute('index'));
    let index!: number;

    if (forward) {
      index = this.state.shuffle ? this.state.songs[Math.floor(Math.random() * this.state.songs.length)].id : current >= this.state.songs.length - 1 ? 0 : current + 1;
    } else {
      index = current <= 0 ? 1 : current + 1;
    }

    this.play(index);
  }

  render() {
    return <>
      <h1>Player Testing</h1>
      <hr />
      <AudioList songs={this.state.songs.map(s => <SongComponent song={s} />)} />
      {/*<AudioController />*/}
    </>;
  }
}