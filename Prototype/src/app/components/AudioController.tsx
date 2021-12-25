import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dispatchEvent } from 'event-dispatcher';
import React from 'react';

export default class AudioControllerComponent extends React.Component {
  onPlay(event: React.MouseEvent) {
    event.preventDefault();

    log('info', 'Playing the first song...');
    dispatchEvent('player', 'play');
  }

  onRepeatState(event: React.MouseEvent) {
    event.preventDefault();

    log('info', 'Setting repeat toggle state...');
    dispatchEvent('player', 'repeat');
  }

  onShuffleState(event: React.MouseEvent) {
    event.preventDefault();

    log('info', 'Setting shuffle toggle state...');
    dispatchEvent('player', 'shuffle');
  }

  onForward(event: React.MouseEvent) {
    event.preventDefault();

    log('info', 'Skipping to the next song...');
    dispatchEvent('player', 'forward');
  }

  onBackward(event: React.MouseEvent) {
    event.preventDefault();

    log('info', 'Skipping to the previous song...');
    dispatchEvent('player', 'backward');
  }

  onSliderVelocity() {
    const slider = document.getElementById('vol-slider')!;
    slider.oninput = function onSliderInput() {
      // this is any because the this context is the global event emitter
      dispatchEvent('player', 'volume', (this as any).value);
      kashima.settings.set('volume', (this as any).value);
    };
  }

  componentDidMount() {
    // Do the slider function when this component has mounted to the browser
    this.onSliderVelocity();
  }

  render() {
    const value = kashima.settings.get<number>('volume', 50);

    // All of the elements have an ID so, when it's enabled, it'll show
    // a greenish color on the icon to indicate it's enabled
    // otherwise, remove the CSS element when it's disabled
    return (
      <div className='controller'>
        <FontAwesomeIcon id='shuffle' icon='random' style={{ cursor: 'pointer' }} onClick={this.onShuffleState.bind(this)} />
        <FontAwesomeIcon icon='backward' style={{ cursor: 'pointer' }} onClick={this.onBackward.bind(this)} />
        <FontAwesomeIcon id='play' icon='play-circle' style={{ cursor: 'pointer' }} onClick={this.onPlay.bind(this)} />
        <FontAwesomeIcon icon='forward' style={{ cursor: 'pointer' }} onClick={this.onForward.bind(this)} />
        <FontAwesomeIcon id='repeat' icon='repeat' style={{ cursor: 'pointer' }} onClick={this.onRepeatState.bind(this)} />
        <div className='controller-end'>
          <input id='vol-slider' className='slider' type='range' value={value} min='1' max='100' />
        </div>
        <br />
        <span id='artist' className='controller-title'></span> <span id='title' className='controller-title'></span>
        {/* TODO: Add a bar here to indicate the length of the song */}
      </div>
    );
  }
}