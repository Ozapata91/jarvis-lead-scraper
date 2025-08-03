// 📁 bootstrap.mjs
import { Blob } from 'buffer';
globalThis.Blob ??= Blob;

await import('./run.js');
