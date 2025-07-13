// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.RELAYER_URL = 'http://localhost:3001';
process.env.AUTH_TOKEN = 'test-auth-token';
process.env.CHAIN_ID = '11155111';
process.env.MOTHER_CONTRACT_ADDRESS = '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}; 