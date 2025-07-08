/**
 * @fileoverview UnifiedID SDK - Functional Programming Approach
 * @author kunalmkv
 * @version 1.0.0
 */

const { ethers } = require('ethers');
const axios = require('axios');
const R = require('ramda');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// ========================================
// CONSTANTS AND CONFIGURATION
// ========================================

const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  SEPOLIA: 11155111,
  POLYGON: 137,
  ARBITRUM: 42161,
  BASE: 8453,
  OPTIMISM: 10,
  BSC: 56,
  AVALANCHE: 43114
};

const DEFAULT_CONFIG = {
  apiUrl: 'http://localhost:3000',
  apiKey: '',
  rpcUrls: {},
  contractAddresses: {
    mother: {},
    child: {},
    resolver: {}
  },
  timeouts: {
    transaction: 300000, // 5 minutes
    confirmation: 300000, // 5 minutes
    api: 30000 // 30 seconds
  },
  retries: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    maxBackoff: 30000
  },
  logging: {
    level: 'info',
    enabled: true
  }
};

// ========================================
// PURE UTILITY FUNCTIONS
// ========================================

/**
 * Pure function to merge configurations
 * @param {Object} defaultConfig - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} Merged configuration
 */
const mergeConfig = R.mergeDeepLeft;

/**
 * Pure function to validate chain ID
 * @param {number} chainId - Chain ID to validate
 * @returns {boolean} Whether chain is supported
 */
const isValidChainId = R.pipe(
  R.values,
  R.includes(R.__, SUPPORTED_CHAINS)
);

/**
 * Pure function to create operation ID
 * @param {string} operationType - Type of operation
 * @param {string} unifiedId - UnifiedID
 * @returns {string} Operation ID
 */
const createOperationId = (operationType, unifiedId) => 
  `${operationType}_${unifiedId}_${uuidv4()}`;

/**
 * Pure function to create deadline timestamp
 * @param {number} minutesFromNow - Minutes from now
 * @returns {number} Deadline timestamp
 */
const createDeadline = (minutesFromNow = 30) => 
  Math.floor(Date.now() / 1000) + (minutesFromNow * 60);

/**
 * Pure function to validate UnifiedID format
 * @param {string} unifiedId - UnifiedID to validate
 * @returns {boolean} Whether UnifiedID is valid
 */
const isValidUnifiedId = (unifiedId) => {
  if (!unifiedId || typeof unifiedId !== 'string') return false;
  if (unifiedId.length < 3 || unifiedId.length > 20) return false;
  return /^[a-zA-Z0-9_-]+$/.test(unifiedId);
};

/**
 * Pure function to validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} Whether address is valid
 */
const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Pure function to create logger
 * @param {Object} config - Logger configuration
 * @returns {Object} Winston logger instance
 */
const createLogger = (config) => {
  if (!config.enabled) {
    return {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {}
    };
  }

  return winston.createLogger({
    level: config.level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [UNIFIEDID-SDK] ${level}: ${message}`;
      })
    ),
    transports: [new winston.transports.Console()]
  });
};

/**
 * Pure function to create HTTP client
 * @param {Object} config - HTTP client configuration
 * @returns {Object} Axios instance
 */
const createHttpClient = (config) => {
  return axios.create({
    baseURL: config.apiUrl,
    timeout: config.timeouts.api,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'UnifiedID-SDK/1.0.0'
    }
  });
};

/**
 * Pure function to create provider
 * @param {string} rpcUrl - RPC URL
 * @param {Object} config - Provider configuration
 * @returns {Object} Ethers provider
 */
const createProvider = (rpcUrl, config) => {
  return new ethers.JsonRpcProvider(rpcUrl, undefined, {
    staticNetwork: true,
    batchMaxCount: 1
  });
};

// ========================================
// ERROR HANDLING FUNCTIONS
// ========================================

/**
 * Pure function to create standardized error
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Error details
 * @returns {Object} Standardized error
 */
const createError = (code, message, details = {}) => ({
  code,
  message,
  details,
  timestamp: Date.now()
});

/**
 * Pure function to handle API errors
 * @param {Object} error - Axios error
 * @returns {Object} Standardized error
 */
const handleApiError = (error) => {
  if (error.response) {
    return createError(
      'API_ERROR',
      error.response.data?.message || 'API request failed',
      {
        status: error.response.status,
        data: error.response.data
      }
    );
  }
  
  if (error.request) {
    return createError(
      'NETWORK_ERROR',
      'Network request failed',
      { request: error.request }
    );
  }
  
  return createError(
    'UNKNOWN_ERROR',
    error.message || 'Unknown error occurred',
    { originalError: error }
  );
};

/**
 * Pure function to handle transaction errors
 * @param {Object} error - Transaction error
 * @returns {Object} Standardized error
 */
const handleTransactionError = (error) => {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return createError('INSUFFICIENT_FUNDS', 'Insufficient funds for transaction');
  }
  
  if (error.code === 'NONCE_EXPIRED') {
    return createError('NONCE_EXPIRED', 'Transaction nonce has expired');
  }
  
  if (error.code === 'REPLACEMENT_UNDERPRICED') {
    return createError('REPLACEMENT_UNDERPRICED', 'Replacement transaction underpriced');
  }
  
  return createError(
    'TRANSACTION_ERROR',
    error.message || 'Transaction failed',
    { originalError: error }
  );
};

// ========================================
// MAIN SDK CLASS
// ========================================

class UnifiedIdSDK {
  constructor(config = {}) {
    // Merge configurations
    this.config = mergeConfig(DEFAULT_CONFIG, config);
    
    // Initialize components
    this.logger = createLogger(this.config.logging);
    this.httpClient = createHttpClient(this.config);
    this.providers = new Map();
    this.eventListeners = new Map();
    
    // Initialize providers for configured chains
    this._initializeProviders();
    
    this.logger.info('UnifiedID SDK initialized');
  }

  /**
   * Initialize providers for configured chains
   * @private
   */
  _initializeProviders() {
    R.forEachObjIndexed((rpcUrl, chainId) => {
      if (rpcUrl && isValidChainId(parseInt(chainId))) {
        try {
          const provider = createProvider(rpcUrl, this.config);
          this.providers.set(parseInt(chainId), provider);
          this.logger.info(`Provider initialized for chain ${chainId}`);
        } catch (error) {
          this.logger.error(`Failed to initialize provider for chain ${chainId}:`, error.message);
        }
      }
    }, this.config.rpcUrls);
  }

  /**
   * Get provider for specific chain
   * @param {number} chainId - Chain ID
   * @returns {Object} Provider instance
   */
  getProvider(chainId) {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not available for chain ${chainId}`);
    }
    return provider;
  }

  /**
   * Set signer for transactions
   * @param {Object} signer - Ethers signer
   */
  setSigner(signer) {
    if (!signer || typeof signer.signMessage !== 'function') {
      throw new Error('Invalid signer provided');
    }
    this.signer = signer;
    this.logger.info('Signer set successfully');
  }

  /**
   * Emit event to listeners
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  emit(eventType, data) {
    const listeners = this.eventListeners.get(eventType) || [];
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data
    };
    
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        this.logger.error(`Error in event listener for ${eventType}:`, error.message);
      }
    });
  }

  /**
   * Add event listener
   * @param {string} eventType - Event type
   * @param {Function} listener - Event listener function
   */
  on(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(listener);
  }

  /**
   * Remove event listener
   * @param {string} eventType - Event type
   * @param {Function} listener - Event listener function
   */
  off(eventType, listener) {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health check result
   */
  async healthCheck() {
    try {
      const response = await this.httpClient.get('/health');
      return {
        status: 'healthy',
        timestamp: Date.now(),
        data: response.data
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: Date.now(),
        error: handleApiError(error)
      };
    }
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  async getStats() {
    try {
      const response = await this.httpClient.get('/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get queue status
   * @returns {Promise<Object>} Queue status
   */
  async getQueueStatus() {
    try {
      const response = await this.httpClient.get('/queue/status');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Validate configuration
   * @returns {Object} Validation result
   */
  validateConfig() {
    const errors = [];
    
    if (!this.config.apiUrl) {
      errors.push('API URL is required');
    }
    
    if (Object.keys(this.config.rpcUrls).length === 0) {
      errors.push('At least one RPC URL is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supported chains
   * @returns {Object} Supported chains
   */
  getSupportedChains() {
    return SUPPORTED_CHAINS;
  }

  /**
   * Check if chain is supported
   * @param {number} chainId - Chain ID
   * @returns {boolean} Whether chain is supported
   */
  isChainSupported(chainId) {
    return isValidChainId(chainId);
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  UnifiedIdSDK,
  SUPPORTED_CHAINS,
  DEFAULT_CONFIG,
  // Pure utility functions
  mergeConfig,
  isValidChainId,
  createOperationId,
  createDeadline,
  isValidUnifiedId,
  isValidAddress,
  createLogger,
  createHttpClient,
  createProvider,
  createError,
  handleApiError,
  handleTransactionError
}; 