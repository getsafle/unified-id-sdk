const { 
  DEFAULT_CONFIG,
  createOptions,
  createHttpClient
} = require('../src/index');

describe('Unified ID SDK - Simple Tests', () => {
  describe('Configuration', () => {
    test('DEFAULT_CONFIG should have correct structure', () => {
      expect(DEFAULT_CONFIG).toHaveProperty('baseURL');
      expect(DEFAULT_CONFIG).toHaveProperty('timeout');
      expect(DEFAULT_CONFIG).toHaveProperty('chainId');
      expect(DEFAULT_CONFIG).toHaveProperty('motherContractAddress');
    });

    test('Configuration should be mergeable', () => {
      const customConfig = {
        baseURL: 'https://custom-api.com',
        authToken: 'custom-token'
      };

      const mergedConfig = { ...DEFAULT_CONFIG, ...customConfig };
      
      expect(mergedConfig.baseURL).toBe('https://custom-api.com');
      expect(mergedConfig.authToken).toBe('custom-token');
      expect(mergedConfig.timeout).toBe(DEFAULT_CONFIG.timeout);
    });
  });

  describe('Utility Functions', () => {
    test('createOptions should create options blob', () => {
      const nonce = '0';
      const options = createOptions(nonce, 3600);
      expect(options).toMatch(/^0x/);
    });

    test('createHttpClient should create axios instance', () => {
      const config = {
        baseURL: 'https://test-api.com',
        authToken: 'test-token',
        timeout: 5000
      };
      
      const client = createHttpClient(config);
      expect(client).toBeDefined();
    });
  });
}); 