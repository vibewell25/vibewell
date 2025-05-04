// Mock for DRACOLoader from Three.js
class DRACOLoader {
  constructor() {
    this.setDecoderPath = jest.fn(() => this);
    this.setDecoderConfig = jest.fn(() => this);
    this.setWorkerLimit = jest.fn(() => this);
    this.preload = jest.fn(() => this);
    this.dispose = jest.fn();
  }
}

module.exports = { DRACOLoader };
