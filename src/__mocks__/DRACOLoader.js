/**
 * Mock implementation of Three.js DRACOLoader
 */
class DRACOLoader {
  constructor() {
    this.decoderPath = '';
    this.decoderConfig = {};
    this.decoderPending = null;
    this.workerLimit = 4;
    this.workerPool = [];
    this.workerNextTaskID = 1;
    this.workerSourceURL = '';
    this.defaultAttributeIDs = {};
    this.defaultAttributeTypes = {};
  }

  setDecoderPath(path) {
    this.decoderPath = path;
    return this;
  }

  setDecoderConfig(config) {
    this.decoderConfig = config;
    return this;
  }

  setWorkerLimit(workerLimit) {
    this.workerLimit = workerLimit;
    return this;
  }

  load(url, onLoad, onProgress, onError) {
    // Mock implementation - doesn't actually load anything
    if (onLoad) {
      setTimeout(() => onLoad({
        // Mock geometry data
        attributes: {
          position: { array: new Float32Array([0, 0, 0]), count: 1 },
          normal: { array: new Float32Array([0, 1, 0]), count: 1 },
          uv: { array: new Float32Array([0, 0]), count: 1 }
        },
        index: { array: new Uint16Array([0]), count: 1 }
      }), 0);
    }
    return this;
  }

  preload() {
    return this;
  }

  dispose() {
    return this;
  }
}

module.exports = { DRACOLoader }; 