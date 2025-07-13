const { 
  createUnifiedIdSDK, 
  UnifiedIdSDK,
  generateRegistrationSignatures,
  generateUpdateSignature 
} = require('../index');

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock ethers
jest.mock('ethers');
const { ethers } = require('ethers');

describe('Unified ID SDK', () => {
  let sdk;
  let mockWallet;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock wallet
    mockWallet = {
      signTypedData: jest.fn().mockResolvedValue('0xmock-signature'),
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    };
    
    ethers.Wallet.mockImplementation(() => mockWallet);
    
    // Mock axios response
    axios.mockResolvedValue({
      data: { success: true, message: 'Test response' },
      status: 200
    });

    // Create SDK instance
    sdk = createUnifiedIdSDK({
      baseURL: 'http://localhost:3001',
      authToken: 'test-token',
      chainId: 11155111,
      motherContractAddress: '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202'
    });
  });

  describe('SDK Initialization', () => {
    test('should create SDK instance with valid config', () => {
      expect(sdk).toBeInstanceOf(UnifiedIdSDK);
      expect(sdk.getConfig().baseURL).toBe('http://localhost:3001');
      expect(sdk.getConfig().authToken).toBe('test-token');
    });

    test('should throw error for missing baseURL', () => {
      expect(() => {
        createUnifiedIdSDK({
          authToken: 'test-token'
        });
      }).toThrow('baseURL is required');
    });

    test('should throw error for missing authToken', () => {
      expect(() => {
        createUnifiedIdSDK({
          baseURL: 'http://localhost:3001'
        });
      }).toThrow('authToken is required');
    });
  });

  describe('Health Check', () => {
    test('should get health status successfully', async () => {
      const result = await sdk.getHealth();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: 'Test response' });
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://localhost:3001/health',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
    });

    test('should handle health check error', async () => {
      const errorResponse = {
        response: {
          data: { error: 'Service unavailable' },
          status: 503
        }
      };
      axios.mockRejectedValue(errorResponse);

      const result = await sdk.getHealth();
      
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ error: 'Service unavailable' });
      expect(result.status).toBe(503);
    });
  });

  describe('Ping Service', () => {
    test('should ping service successfully', async () => {
      const result = await sdk.ping();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ success: true, message: 'Test response' });
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://localhost:3001/ping',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
    });
  });

  describe('Signature Generation', () => {
    test('should generate registration signatures', async () => {
      const params = {
        unifiedId: 'test-user',
        primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        masterPrivateKey: '0x123',
        primaryPrivateKey: '0x456'
      };

      const signatures = await sdk.generateRegistrationSignatures(params);
      
      expect(signatures.masterSignature).toBe('0xmock-signature');
      expect(signatures.primarySignature).toBe('0xmock-signature');
      expect(signatures.nonce).toBeDefined();
      expect(signatures.deadline).toBeDefined();
      expect(mockWallet.signTypedData).toHaveBeenCalledTimes(2);
    });

    test('should generate update signature', async () => {
      const params = {
        previousUnifiedId: 'old-user',
        newUnifiedId: 'new-user',
        masterPrivateKey: '0x123'
      };

      const signature = await sdk.generateUpdateSignature(params);
      
      expect(signature).toBe('0xmock-signature');
      expect(mockWallet.signTypedData).toHaveBeenCalledTimes(1);
    });

    test('should throw error for missing contract address', async () => {
      const sdkWithoutContract = createUnifiedIdSDK({
        baseURL: 'http://localhost:3001',
        authToken: 'test-token',
        chainId: 11155111
        // Missing motherContractAddress
      });

      const params = {
        unifiedId: 'test-user',
        primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        masterPrivateKey: '0x123',
        primaryPrivateKey: '0x456'
      };

      await expect(sdkWithoutContract.generateRegistrationSignatures(params))
        .rejects.toThrow('motherContractAddress is required for signature generation');
    });
  });

  describe('Registration', () => {
    test('should register Unified ID with automatic signatures', async () => {
      const params = {
        unifiedId: 'test-user',
        primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        masterPrivateKey: '0x123',
        primaryPrivateKey: '0x456'
      };

      const result = await sdk.registerUnifiedId(params);
      
      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/set-unifiedid',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: {
          userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          unifiedId: 'test-user',
          chainId: 11155111,
          masterSignature: '0xmock-signature',
          primarySignature: '0xmock-signature',
          options: ''
        }
      });
    });

    test('should register Unified ID with manual signatures', async () => {
      const params = {
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        unifiedId: 'test-user',
        masterSignature: '0xmaster-sig',
        primarySignature: '0xprimary-sig'
      };

      const result = await sdk.setUnifiedId(params);
      
      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/set-unifiedid',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: {
          userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          unifiedId: 'test-user',
          chainId: 11155111,
          masterSignature: '0xmaster-sig',
          primarySignature: '0xprimary-sig',
          options: ''
        }
      });
    });
  });

  describe('Update Operations', () => {
    test('should update Unified ID with automatic signature', async () => {
      const params = {
        previousUnifiedId: 'old-user',
        newUnifiedId: 'new-user',
        masterPrivateKey: '0x123'
      };

      const result = await sdk.updateUnifiedId(params);
      
      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/update-unifiedid',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: {
          previousUnifiedId: 'old-user',
          newUnifiedId: 'new-user',
          signature: '0xmock-signature',
          chainId: 11155111,
          options: ''
        }
      });
    });

    test('should update Unified ID with manual signature', async () => {
      const params = {
        previousUnifiedId: 'old-user',
        newUnifiedId: 'new-user',
        signature: '0xmanual-sig'
      };

      const result = await sdk.updateUnifiedIdManual(params);
      
      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/update-unifiedid',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: {
          previousUnifiedId: 'old-user',
          newUnifiedId: 'new-user',
          signature: '0xmanual-sig',
          chainId: 11155111,
          options: ''
        }
      });
    });
  });

  describe('Address Management', () => {
    test('should update primary address', async () => {
      const params = {
        unifiedId: 'test-user',
        newPrimaryAddress: '0xnew-address',
        currentPrimarySignature: '0xcurrent-sig',
        newPrimarySignature: '0xnew-sig'
      };

      const result = await sdk.updatePrimaryAddress(params);
      
      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/update-primary-address',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: {
          unifiedId: 'test-user',
          chainId: 11155111,
          newPrimaryAddress: '0xnew-address',
          currentPrimarySignature: '0xcurrent-sig',
          newPrimarySignature: '0xnew-sig',
          options: ''
        }
      });
    });

    test('should add secondary address', async () => {
      const params = {
        unifiedId: 'test-user',
        secondaryAddress: '0xsecondary-address',
        primarySignature: '0xprimary-sig',
        secondarySignature: '0xsecondary-sig'
      };

      const result = await sdk.addSecondaryAddress(params);
      
      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/add-secondary-address',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: {
          unifiedId: 'test-user',
          chainId: 11155111,
          secondaryAddress: '0xsecondary-address',
          primarySignature: '0xprimary-sig',
          secondarySignature: '0xsecondary-sig',
          options: ''
        }
      });
    });

    test('should remove secondary address', async () => {
      const params = {
        unifiedId: 'test-user',
        secondaryAddress: '0xsecondary-address',
        signature: '0xsignature'
      };

      const result = await sdk.removeSecondaryAddress(params);
      
      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/remove-secondary-address',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: {
          unifiedId: 'test-user',
          chainId: 11155111,
          secondaryAddress: '0xsecondary-address',
          signature: '0xsignature',
          options: ''
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      axios.mockRejectedValue(new Error('Network error'));

      const result = await sdk.getHealth();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.status).toBe(null);
    });

    test('should handle signature generation errors', async () => {
      mockWallet.signTypedData.mockRejectedValue(new Error('Signature error'));

      const params = {
        unifiedId: 'test-user',
        primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        masterPrivateKey: '0x123',
        primaryPrivateKey: '0x456'
      };

      await expect(sdk.generateRegistrationSignatures(params))
        .rejects.toThrow('Signature generation failed: Signature error');
    });
  });
}); 