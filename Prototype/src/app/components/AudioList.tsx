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

interface AudioListProps {
  songs: JSX.Element[];
}

export default class AudioListComponent extends React.Component<AudioListProps> {
  render() {
    return <table className='audio-list'>
      <tbody>
        
      </tbody>
    </table>;
  }
}