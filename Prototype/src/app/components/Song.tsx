import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dispatchEvent } from 'event-dispatcher';
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

interface SongProperties {
  song: Song;
}

export default class SongComponent extends React.Component<SongProperties> {
  get song() {
    return this.props.song;
  }

  onPlay(event: React.MouseEvent, id: number) {
    event.preventDefault();
    dispatchEvent('player', 'play', id);
  }

  render() {
    return <>
      <tr className='cell'>
        <td className='cell-text'>
          <FontAwesomeIcon icon='play-circle' style={{ cursor: 'pointer' }} onClick={event => this.onPlay(event, this.song.id)} />
        </td>
        <td className='cell-text'>
          <p className='cell-text-markup'>{this.song.artist}</p>          
        </td>
        <td className='cell-text'>
          <p className='cell-text-markup'>{this.song.title}</p>         
        </td>
        <td className='cell-text'>
          <p className='cell-text-markup'>{this.song.duration}</p>         
        </td>
      </tr>
    </>;
  }
}