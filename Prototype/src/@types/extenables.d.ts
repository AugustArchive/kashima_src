interface JSON {
  parse<T = any>(text: string, reviver?: (this: T, key: string, value: any) => any): T;
}

declare namespace Electron {
  interface Remote {
    getGlobal<T>(name: string): T;
  }
}

interface HTMLAudioElement {
  /**
   * Distorts the audio with the specific curve
   * @param curve The curve to distort the audio from
   */
  // Credit: https://medium.com/@alexanderleon/web-audio-series-part-2-designing-distortion-using-javascript-and-the-web-audio-api-446301565541
  distort(curve?: number): void;

  /**
   * Makes the audio into a Nightcore song
   */
  nightcore(): void;
}