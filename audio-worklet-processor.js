// public/audio-worklet-processor.js
import Essentia from './essentia/essentia.js-core.es.js';
import { EssentiaWASM } from './essentia/essentia-wasm.module.js'; // Ensure this is correct

let essentia = null;
const BUFFER_SIZE = 2048;

class EssentiaPitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(0);

    try {
      essentia = new Essentia(EssentiaWASM);
      console.log('✅ Essentia WebAssembly loaded in AudioWorklet');
      this.port.postMessage({ type: 'status', message: 'Essentia ready in worklet' });
    } catch (e) {
      console.error('Error loading Essentia in AudioWorklet during construction:', e);
      this.port.postMessage({ type: 'error', error: 'Failed to load Essentia in worklet during construction' });
    }

    this.port.onmessage = (event) => {};
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0 || !essentia) {
      return true;
    }

    const inputData = input[0];

    const newBuffer = new Float32Array(this.buffer.length + inputData.length);
    newBuffer.set(this.buffer, 0);
    newBuffer.set(inputData, this.buffer.length);
    this.buffer = newBuffer;

    if (this.buffer.length >= BUFFER_SIZE) {
      const segment = this.buffer.subarray(0, BUFFER_SIZE);
      this.buffer = this.buffer.subarray(BUFFER_SIZE);

      try {
        // This is the correct, simple way to pass the Float32Array
        const result = essentia.PitchYin({
          signal: segment,
          sampleRate: 48000, // Ensure this matches your AudioContext's sample rate
        });

        const pitch = result.pitch;
        this.port.postMessage({ type: 'pitchResult', pitch: pitch });

      } catch (err) {
        console.error('🎵 Pitch detection error (inside worklet process):', err);
        this.port.postMessage({ type: 'error', error: err.message || String(err) });
      }
    }

    return true;
  }
}

registerProcessor('essentia-pitch-processor', EssentiaPitchProcessor);