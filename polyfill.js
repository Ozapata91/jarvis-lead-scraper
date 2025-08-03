import { Blob } from 'buffer';

if (typeof globalThis.Blob === 'undefined') {
  globalThis.Blob = Blob;
}

class File extends Blob {
  constructor(parts, filename, options) {
    super(parts, options);
    this.name = filename;
    this.lastModified = options?.lastModified ?? Date.now();
  }
}
if (typeof globalThis.File === 'undefined') {
  globalThis.File = File;
}
