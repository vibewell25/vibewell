// Mock for DRACOLoader
class DRACOLoader {
  constructor() {
    this.setDecoderPath = jest.fn().mockReturnThis();
    this.setDecoderConfig = jest.fn().mockReturnThis();
    this.preload = jest.fn().mockReturnThis();
    this.load = jest.fn((url, onLoad) => {
      // Simulate successful loading
      if (onLoad) {
        setTimeout(() => {
          onLoad({});
        }, 0);
      }
    });
  }
}

module.exports = { DRACOLoader };
