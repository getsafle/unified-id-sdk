/**
 * Unified ID Relayer SDK
 * Official SDK for Unified ID blockchain identity management
 * 
 * @version 1.0.0
 * @description Comprehensive SDK for Node.js applications
 */

const axios = require('axios');
const { ethers } = require('ethers');

// ===== CONFIGURATION =====

const DEFAULT_CONFIG = {
  baseURL: 'http://localhost:3001',
  authToken: null,
  timeout: 30000,
  chainId: 11155111, // Sepolia default
  motherContractAddress: null,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// ===== CORE FUNCTIONS =====

/**
 * Make API request with error handling
 * @param {Object} config - SDK configuration
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response object
 */
async function makeRequest(config, method, endpoint, data = null) {
  try {
    const requestConfig = {
      method,
      url: `${config.baseURL}${endpoint}`,
      timeout: config.timeout,
      headers: { ...config.headers }
    };

    if (config.authToken) {
      requestConfig.headers.Authorization = `Bearer ${config.authToken}`;
    }

    if (data) {
      requestConfig.data = data;
    }

    const response = await axios(requestConfig);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: error.response.data,
        status: error.response.status
      };
    }
    return {
      success: false,
      error: error.message,
      status: null
    };
  }
}

/**
 * Generate EIP-712 signature for Unified ID operations
 * @param {string} privateKey - Private key for signing
 * @param {Object} domain - EIP-712 domain
 * @param {Object} types - EIP-712 types
 * @param {Object} message - EIP-712 message
 * @returns {Promise<string>} Signature
 */
async function generateEIP712Signature(privateKey, domain, types, message) {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signTypedData(domain, types, message);
    return signature;
  } catch (error) {
    throw new Error(`Signature generation failed: ${error.message}`);
  }
}

/**
 * Create EIP-712 domain for Unified ID operations
 * @param {number} chainId - Chain ID
 * @param {string} contractAddress - Contract address
 * @returns {Object} EIP-712 domain
 */
function createDomain(chainId, contractAddress) {
  return {
    name: 'UnifiedID',
    version: '1',
    chainId: chainId,
    verifyingContract: contractAddress
  };
}

// ===== API FUNCTIONS =====

/**
 * Register a new Unified ID (Queue API)
 */
async function setUnifiedId(config, params) {
  const requestData = {
    action: 'initiate-register-unifiedid',
    unifiedId: params.unifiedId,
    primaryAddress: params.primaryAddress,
    masterSignature: params.masterSignature,
    primarySignature: params.primarySignature,
    options: params.options || ''
  };
  return await makeRequest(config, 'POST', '/api/initiate-register-unifiedid', requestData);
}

/**
 * Update an existing Unified ID (Queue API)
 */
async function updateUnifiedId(config, params) {
  const requestData = {
    action: 'initiate-update-unifiedid',
    oldUnifiedId: params.previousUnifiedId,
    newUnifiedId: params.newUnifiedId,
    signature: params.signature,
    options: params.options || ''
  };
  return await makeRequest(config, 'POST', '/api/initiate-update-unifiedid', requestData);
}

/**
 * Update primary address for a Unified ID (Queue API)
 */
async function updatePrimaryAddress(config, params) {
  const requestData = {
    action: 'initiate-primary-address-change',
    unifiedId: params.unifiedId,
    newPrimaryAddress: params.newPrimaryAddress,
    currentPrimarySignature: params.currentPrimarySignature,
    newPrimarySignature: params.newPrimarySignature,
    options: params.options || ''
  };
  return await makeRequest(config, 'POST', '/api/initiate-primary-address-change', requestData);
}

/**
 * Add a secondary address to a Unified ID (Queue API)
 */
async function addSecondaryAddress(config, params) {
  const requestData = {
    action: 'initiate-add-secondary-address',
    unifiedId: params.unifiedId,
    secondaryAddress: params.secondaryAddress,
    primarySignature: params.primarySignature,
    secondarySignature: params.secondarySignature,
    options: params.options || ''
  };
  return await makeRequest(config, 'POST', '/api/initiate-add-secondary-address', requestData);
}

/**
 * Remove a secondary address from a Unified ID (Queue API)
 */
async function removeSecondaryAddress(config, params) {
  const requestData = {
    action: 'initiate-remove-secondary-address',
    unifiedId: params.unifiedId,
    secondaryAddress: params.secondaryAddress,
    signature: params.signature,
    options: params.options || ''
  };
  return await makeRequest(config, 'POST', '/api/initiate-remove-secondary-address', requestData);
}

/**
 * Get service health status
 * @param {Object} config - SDK configuration
 * @returns {Promise<Object>} Health status
 */
async function getHealth(config) {
  return await makeRequest(config, 'GET', '/health');
}

/**
 * Ping the service
 * @param {Object} config - SDK configuration
 * @returns {Promise<Object>} Ping response
 */
async function ping(config) {
  return await makeRequest(config, 'GET', '/ping');
}

// ===== SIGNATURE GENERATION HELPERS =====

/**
 * Generate registration signatures
 * @param {Object} config - SDK configuration
 * @param {Object} params - Registration parameters
 * @returns {Promise<Object>} Signatures object
 */
async function generateRegistrationSignatures(config, params) {
  if (!config.motherContractAddress) {
    throw new Error('motherContractAddress is required for signature generation');
  }

  const domain = createDomain(config.chainId, config.motherContractAddress);
  const types = {
    RegisterUnifiedId: [
      { name: 'unifiedId', type: 'string' },
      { name: 'primaryAddress', type: 'address' },
      { name: 'targetChainId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  const nonce = Date.now();
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  const message = {
    unifiedId: params.unifiedId,
    primaryAddress: params.primaryAddress,
    targetChainId: config.chainId,
    nonce: nonce,
    deadline: deadline
  };

  const masterSignature = await generateEIP712Signature(
    params.masterPrivateKey,
    domain,
    types,
    message
  );

  const primarySignature = await generateEIP712Signature(
    params.primaryPrivateKey,
    domain,
    types,
    message
  );

  // Create signature data arrays as expected by the contract
  const masterSigData = [nonce, deadline, masterSignature];
  const primarySigData = [nonce, deadline, primarySignature];

  return {
    masterSignature,
    primarySignature,
    masterSigData,
    primarySigData,
    nonce,
    deadline
  };
}

/**
 * Generate update signature
 * @param {Object} config - SDK configuration
 * @param {Object} params - Update parameters
 * @returns {Promise<string>} Signature
 */
async function generateUpdateSignature(config, params) {
  if (!config.motherContractAddress) {
    throw new Error('motherContractAddress is required for signature generation');
  }

  const domain = createDomain(config.chainId, config.motherContractAddress);
  const types = {
    UpdateUnifiedId: [
      { name: 'previousUnifiedId', type: 'string' },
      { name: 'newUnifiedId', type: 'string' },
      { name: 'targetChainId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  const nonce = Date.now();
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  const message = {
    previousUnifiedId: params.previousUnifiedId,
    newUnifiedId: params.newUnifiedId,
    targetChainId: config.chainId,
    nonce: nonce,
    deadline: deadline
  };

  const signature = await generateEIP712Signature(
    params.masterPrivateKey,
    domain,
    types,
    message
  );

  // Create signature data array as expected by the contract
  const signatureData = [nonce, deadline, signature];

  return {
    signature,
    signatureData,
    nonce,
    deadline
  };
}

// ===== SDK CLASS =====

/**
 * Unified ID SDK Class
 */
class UnifiedIdSDK {
  /**
   * Create a new SDK instance
   * @param {Object} userConfig - User configuration
   */
  constructor(userConfig) {
    this.config = { ...DEFAULT_CONFIG, ...userConfig };

    if (!this.config.baseURL) {
      throw new Error('baseURL is required');
    }

    if (!this.config.authToken) {
      throw new Error('authToken is required');
    }
  }

  /**
   * Register a new Unified ID with automatic signature generation
   * @param {Object} params - Registration parameters
   * @returns {Promise<Object>} Response object
   */
  async registerUnifiedId(params) {
    const signatures = await generateRegistrationSignatures(this.config, params);
    
    return await setUnifiedId(this.config, {
      ...params,
      masterSignature: signatures.masterSignature,
      primarySignature: signatures.primarySignature
    });
  }

  /**
   * Update Unified ID with automatic signature generation
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Response object
   */
  async updateUnifiedId(params) {
    const signatureResult = await generateUpdateSignature(this.config, params);
    
    return await updateUnifiedId(this.config, {
      ...params,
      signature: signatureResult.signature
    });
  }

  /**
   * Register Unified ID (manual signatures)
   * @param {Object} params - Registration parameters
   * @returns {Promise<Object>} Response object
   */
  async setUnifiedId(params) {
    return await setUnifiedId(this.config, params);
  }

  /**
   * Update Unified ID (manual signature)
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Response object
   */
  async updateUnifiedIdManual(params) {
    return await updateUnifiedId(this.config, params);
  }

  /**
   * Update primary address
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Response object
   */
  async updatePrimaryAddress(params) {
    return await updatePrimaryAddress(this.config, params);
  }

  /**
   * Add secondary address
   * @param {Object} params - Add parameters
   * @returns {Promise<Object>} Response object
   */
  async addSecondaryAddress(params) {
    return await addSecondaryAddress(this.config, params);
  }

  /**
   * Remove secondary address
   * @param {Object} params - Remove parameters
   * @returns {Promise<Object>} Response object
   */
  async removeSecondaryAddress(params) {
    return await removeSecondaryAddress(this.config, params);
  }

  /**
   * Get service health
   * @returns {Promise<Object>} Health status
   */
  async getHealth() {
    return await getHealth(this.config);
  }

  /**
   * Ping service
   * @returns {Promise<Object>} Ping response
   */
  async ping() {
    return await ping(this.config);
  }

  /**
   * Generate registration signatures
   * @param {Object} params - Registration parameters
   * @returns {Promise<Object>} Signatures object
   */
  async generateRegistrationSignatures(params) {
    return await generateRegistrationSignatures(this.config, params);
  }

  /**
   * Generate update signature
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Signature result
   */
  async generateUpdateSignature(params) {
    return await generateUpdateSignature(this.config, params);
  }

  /**
   * Get SDK configuration
   * @returns {Object} Configuration object
   */
  getConfig() {
    return { ...this.config };
  }
}

// ===== FACTORY FUNCTION =====

/**
 * Create SDK instance
 * @param {Object} config - Configuration object
 * @returns {UnifiedIdSDK} SDK instance
 */
function createUnifiedIdSDK(config) {
  return new UnifiedIdSDK(config);
}

// ===== EXPORTS =====

module.exports = {
  UnifiedIdSDK,
  createUnifiedIdSDK,
  setUnifiedId,
  updateUnifiedId,
  updatePrimaryAddress,
  addSecondaryAddress,
  removeSecondaryAddress,
  getHealth,
  ping,
  generateRegistrationSignatures,
  generateUpdateSignature
}; 