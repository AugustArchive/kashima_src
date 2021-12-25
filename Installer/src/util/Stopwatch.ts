import { performance } from 'perf_hooks';
import { randomBytes } from 'crypto';

/**
 * Represents a Stopwatch
 */
class Stopwatch {
  public startTime: number;
  public endTime: number | null;
  public id: string;

  constructor(startTime: number) {
    this.startTime = startTime;
    this.endTime = null;
    this.id = randomBytes(2).toString('hex');
  }

  end(): [number, number] {
    this.endTime = performance.now();
    return [this.startTime, this.endTime];
  }
}

export default class StopwatchContainer {
  /** The stopwatches that were added */
  private stopwatches: { [x: string]: Stopwatch };

  /**
   * Constructs a new Stopwatch Container
   */
  constructor() {
    this.stopwatches = {};
  }

  /**
   * Starts a stopwatch
   */
  start() {
    const now = performance.now();
    const stopwatch = new Stopwatch(now);
    this.stopwatches[stopwatch.id] = stopwatch;

    return stopwatch;
  }

  /**
   * Ends a stopwatch and returns the time that it took
   */
  end(watch: Stopwatch) {
    const [start, end] = watch.end();
    delete this.stopwatches[watch.id];

    return (end! - start);
  }
}