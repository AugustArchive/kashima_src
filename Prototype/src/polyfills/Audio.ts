Audio.prototype.distort = function onDistort(curve: number = 400) {
  const audio = new AudioContext();
  const node = audio.createOscillator();
  const gainNode = audio.createGain();
  const distortNode = audio.createWaveShaper();

  const makeCurve = () => {
    const sampleRate = typeof audio.sampleRate === 'number' ? audio.sampleRate : 44100;
    const _curve = new Float32Array(sampleRate);
    let x!: number;

    for (let i = 0; i < sampleRate; ++i) {
      x = i * 2 / sampleRate - 1;
      _curve[i] = (3 + curve) * Math.atan(Math.sinh(x * 0.25) * 5) / (Math.PI + curve * Math.abs(x));
    }

    return _curve;
  };

  distortNode.curve = makeCurve();

  distortNode.connect(gainNode);
  gainNode.connect(gainNode);
  gainNode.connect(distortNode);
  node.start(0);
};

Audio.prototype.nightcore = function onNightcore(this: HTMLAudioElement) {
  log('info', 'User requested this Audio element to be nightcorified!');

  const context = new AudioContext();
  const osc = context.createOscillator();

  osc.frequency.setValueAtTime(440, context.currentTime);
  osc.frequency.linearRampToValueAtTime(440 * Math.pow(2, 1 / 12), context.currentTime + 1);

  osc.connect(context.destination);
  osc.start();
};