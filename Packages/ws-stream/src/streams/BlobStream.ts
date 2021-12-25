import { Readable, ReadableOptions } from 'stream';
import util from 'util';

export default class BlobReadStream extends Readable {
  public start: number;
  public sync: boolean;

  constructor(public blob: any, public options?: any) {
    super(options);

    this.start = 0;
    this.sync = options.sync || false;
  }

  get slice() {
    return this.blob.slice || this.blob.webkitSlice || this.blob.mozSlice;
  }
}

/*
function BlobReadStream(blob, options) {
  options = options || {};
  this.blob = blob;
  this.slice = blob.slice || blob.webkitSlice || blob.mozSlice;
  this.start = 0;
  this.sync = options.synchronous || false;

  var fileReader;

  if (options.synchronous) {
    fileReader = this.fileReader = new FileReaderSync();
  } else {
    fileReader = this.fileReader = new FileReader();
  }

  fileReader.onload = bind(this, '_onload');
  fileReader.onerror = bind(this, '_onerror');
}

BlobReadStream.prototype._read = function(size) {
  var start = this.start;
  var end = this.start = this.start + size;
  var chunk = this.slice.call(this.blob, start, end);

  if (chunk.size) {
    if (this.sync) {
      var bufferChunk = new Buffer(new Uint8Array(this.fileReader.readAsArrayBuffer(chunk)));
      this.push(bufferChunk);
    } else {
      this.fileReader.readAsArrayBuffer(chunk);
    }
  } else {
    this.push(null);
  }
}

BlobReadStream.prototype._onload = function(e) {
  var chunk = new Buffer(new Uint8Array(e.target.result));
  this.push(chunk);
};

BlobReadStream.prototype._onerror = function(e) {
  var err = e.target.error;
  this.emit('error', err);
};
*/