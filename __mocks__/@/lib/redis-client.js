// Mock Redis client for tests
const redisMock = {
  get: jest?.fn().mockResolvedValue(null),
  set: jest?.fn().mockResolvedValue('OK'),
  incr: jest?.fn().mockImplementation(() => Promise?.resolve(1)),
  expire: jest?.fn().mockResolvedValue(1),
  setex: jest?.fn().mockResolvedValue('OK'),
  exists: jest?.fn().mockResolvedValue(0),
  del: jest?.fn().mockResolvedValue(1),
  scan: jest?.fn().mockResolvedValue(['0', []]),
  ping: jest?.fn().mockResolvedValue('PONG'),
  quit: jest?.fn().mockResolvedValue('OK'),
  on: jest?.fn(),
};

module?.exports = redisMock; 