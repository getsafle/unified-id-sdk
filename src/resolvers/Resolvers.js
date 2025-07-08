/**
 * @fileoverview UnifiedID Resolvers - Functional Programming Approach
 * @author kunalmkv
 * @version 1.0.0
 */

const R = require('ramda');
const { ethers } = require('ethers');
const { 
  isValidUnifiedId, 
  isValidAddress,
  createError,
  handleApiError 
} = require('../core/UnifiedIdSDK');

// ========================================
// PURE VALIDATION FUNCTIONS
// ========================================

/**
 * Pure function to validate resolution parameters
 * @param {string} unifiedId - UnifiedID to resolve
 * @param {number} chainId - Chain ID
 * @returns {Object} Validation result
 */
const validateResolutionParams = (unifiedId, chainId) => {
  const errors = [];
  
  if (!isValidUnifiedId(unifiedId)) {
    errors.push('Invalid UnifiedID format');
  }
  
  if (chainId === undefined || chainId === null) {
    errors.push('Chain ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Pure function to validate address resolution parameters
 * @param {string} address - Address to resolve
 * @param {number} chainId - Chain ID
 * @returns {Object} Validation result
 */
const validateAddressResolutionParams = (address, chainId) => {
  const errors = [];
  
  if (!isValidAddress(address)) {
    errors.push('Invalid address format');
  }
  
  if (chainId === undefined || chainId === null) {
    errors.push('Chain ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========================================
// PURE DATA TRANSFORMATION FUNCTIONS
// ========================================

/**
 * Pure function to transform UnifiedID info
 * @param {Object} rawData - Raw data from API
 * @returns {Object} Transformed UnifiedID info
 */
const transformUnifiedIdInfo = (rawData) => ({
  unifiedId: rawData.unifiedId,
  masterAddress: rawData.masterAddress,
  primaryAddress: rawData.primaryAddress,
  secondaryAddresses: rawData.secondaryAddresses || [],
  chainId: rawData.chainId,
  blockNumber: rawData.blockNumber,
  transactionHash: rawData.transactionHash,
  timestamp: rawData.timestamp
});

/**
 * Pure function to transform address resolution result
 * @param {Object} rawData - Raw data from API
 * @returns {Object} Transformed address resolution result
 */
const transformAddressResolution = (rawData) => ({
  unifiedId: rawData.unifiedId,
  isPrimary: rawData.isPrimary || false,
  isSecondary: rawData.isSecondary || false,
  chainId: rawData.chainId
});

/**
 * Pure function to transform multi-chain info
 * @param {Object} rawData - Raw data from API
 * @returns {Object} Transformed multi-chain info
 */
const transformMultiChainInfo = (rawData) => ({
  unifiedId: rawData.unifiedId,
  masterAddress: rawData.masterAddress,
  chains: R.mapObjIndexed((chainData, chainId) => ({
    primaryAddress: chainData.primaryAddress,
    secondaryAddresses: chainData.secondaryAddresses || [],
    blockNumber: chainData.blockNumber,
    transactionHash: chainData.transactionHash,
    timestamp: chainData.timestamp
  }), rawData.chains || {})
});

// ========================================
// RESOLVER CLASS
// ========================================

class UnifiedIdResolvers {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Resolve UnifiedID to primary address
   * @param {string} unifiedId - UnifiedID to resolve
   * @param {number} chainId - Chain ID
   * @returns {Promise<string>} Primary address
   */
  async resolvePrimaryAddress(unifiedId, chainId) {
    // Validate parameters
    const validation = validateResolutionParams(unifiedId, chainId);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    try {
      const response = await this.sdk.httpClient.get(`/api/resolve/${unifiedId}/primary`, {
        params: { chainId }
      });
      
      return response.data.primaryAddress;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Resolve address to UnifiedID
   * @param {string} address - Address to resolve
   * @param {number} chainId - Chain ID
   * @returns {Promise<string>} UnifiedID
   */
  async resolveUnifiedId(address, chainId) {
    // Validate parameters
    const validation = validateAddressResolutionParams(address, chainId);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    try {
      const response = await this.sdk.httpClient.get(`/api/resolve/address/${address}`, {
        params: { chainId }
      });
      
      return response.data.unifiedId;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get complete UnifiedID information
   * @param {string} unifiedId - UnifiedID to get info for
   * @param {number} chainId - Chain ID
   * @returns {Promise<Object>} Complete UnifiedID info
   */
  async getUnifiedIdInfo(unifiedId, chainId) {
    // Validate parameters
    const validation = validateResolutionParams(unifiedId, chainId);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    try {
      const response = await this.sdk.httpClient.get(`/api/resolve/${unifiedId}`, {
        params: { chainId }
      });
      
      return transformUnifiedIdInfo(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get multi-chain UnifiedID information
   * @param {string} unifiedId - UnifiedID to get info for
   * @returns {Promise<Object>} Multi-chain UnifiedID info
   */
  async getMultiChainUnifiedIdInfo(unifiedId) {
    if (!isValidUnifiedId(unifiedId)) {
      throw createError('VALIDATION_ERROR', 'Invalid UnifiedID format');
    }

    try {
      const response = await this.sdk.httpClient.get(`/api/resolve/${unifiedId}/multichain`);
      return transformMultiChainInfo(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check if address is associated with UnifiedID
   * @param {string} unifiedId - UnifiedID to check
   * @param {string} address - Address to check
   * @param {number} chainId - Chain ID
   * @returns {Promise<Object>} Association result
   */
  async checkAddressAssociation(unifiedId, address, chainId) {
    // Validate parameters
    const validation = validateResolutionParams(unifiedId, chainId);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    if (!isValidAddress(address)) {
      throw createError('VALIDATION_ERROR', 'Invalid address format');
    }

    try {
      const response = await this.sdk.httpClient.get(`/api/resolve/${unifiedId}/check-address`, {
        params: { address, chainId }
      });
      
      return transformAddressResolution(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all addresses for UnifiedID
   * @param {string} unifiedId - UnifiedID to get addresses for
   * @param {number} chainId - Chain ID
   * @returns {Promise<Object>} All addresses
   */
  async getAllAddresses(unifiedId, chainId) {
    // Validate parameters
    const validation = validateResolutionParams(unifiedId, chainId);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    try {
      const response = await this.sdk.httpClient.get(`/api/resolve/${unifiedId}/addresses`, {
        params: { chainId }
      });
      
      return {
        primary: response.data.primary,
        secondary: response.data.secondary || [],
        all: [response.data.primary, ...(response.data.secondary || [])].filter(Boolean)
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Check if UnifiedID is available
   * @param {string} unifiedId - UnifiedID to check
   * @param {number} chainId - Chain ID
   * @returns {Promise<boolean>} Whether UnifiedID is available
   */
  async isUnifiedIdAvailable(unifiedId, chainId) {
    // Validate parameters
    const validation = validateResolutionParams(unifiedId, chainId);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    try {
      const response = await this.sdk.httpClient.get(`/api/resolve/${unifiedId}/available`, {
        params: { chainId }
      });
      
      return response.data.available;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search UnifiedIDs by pattern
   * @param {string} pattern - Search pattern
   * @param {number} chainId - Chain ID
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of matching UnifiedIDs
   */
  async searchUnifiedIds(pattern, chainId, options = {}) {
    if (!pattern || typeof pattern !== 'string') {
      throw createError('VALIDATION_ERROR', 'Search pattern is required');
    }

    if (chainId === undefined || chainId === null) {
      throw createError('VALIDATION_ERROR', 'Chain ID is required');
    }

    try {
      const response = await this.sdk.httpClient.get('/api/search/unifiedids', {
        params: {
          pattern,
          chainId,
          limit: options.limit || 10,
          offset: options.offset || 0
        }
      });
      
      return response.data.results;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get UnifiedID statistics
   * @param {number} chainId - Chain ID
   * @returns {Promise<Object>} Statistics
   */
  async getUnifiedIdStats(chainId) {
    if (chainId === undefined || chainId === null) {
      throw createError('VALIDATION_ERROR', 'Chain ID is required');
    }

    try {
      const response = await this.sdk.httpClient.get('/api/stats/unifiedids', {
        params: { chainId }
      });
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Batch resolve multiple UnifiedIDs
   * @param {Array} unifiedIds - Array of UnifiedIDs to resolve
   * @param {number} chainId - Chain ID
   * @returns {Promise<Array>} Array of resolution results
   */
  async batchResolveUnifiedIds(unifiedIds, chainId) {
    if (!Array.isArray(unifiedIds) || unifiedIds.length === 0) {
      throw createError('VALIDATION_ERROR', 'UnifiedIDs array is required');
    }

    if (chainId === undefined || chainId === null) {
      throw createError('VALIDATION_ERROR', 'Chain ID is required');
    }

    // Validate all UnifiedIDs
    const invalidIds = unifiedIds.filter(id => !isValidUnifiedId(id));
    if (invalidIds.length > 0) {
      throw createError('VALIDATION_ERROR', 'Invalid UnifiedIDs found', { invalidIds });
    }

    try {
      const response = await this.sdk.httpClient.post('/api/resolve/batch', {
        unifiedIds,
        chainId
      });
      
      return response.data.results;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Batch resolve multiple addresses
   * @param {Array} addresses - Array of addresses to resolve
   * @param {number} chainId - Chain ID
   * @returns {Promise<Array>} Array of resolution results
   */
  async batchResolveAddresses(addresses, chainId) {
    if (!Array.isArray(addresses) || addresses.length === 0) {
      throw createError('VALIDATION_ERROR', 'Addresses array is required');
    }

    if (chainId === undefined || chainId === null) {
      throw createError('VALIDATION_ERROR', 'Chain ID is required');
    }

    // Validate all addresses
    const invalidAddresses = addresses.filter(addr => !isValidAddress(addr));
    if (invalidAddresses.length > 0) {
      throw createError('VALIDATION_ERROR', 'Invalid addresses found', { invalidAddresses });
    }

    try {
      const response = await this.sdk.httpClient.post('/api/resolve/addresses/batch', {
        addresses,
        chainId
      });
      
      return response.data.results;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get recent UnifiedID registrations
   * @param {number} chainId - Chain ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of recent registrations
   */
  async getRecentRegistrations(chainId, options = {}) {
    if (chainId === undefined || chainId === null) {
      throw createError('VALIDATION_ERROR', 'Chain ID is required');
    }

    try {
      const response = await this.sdk.httpClient.get('/api/recent/registrations', {
        params: {
          chainId,
          limit: options.limit || 20,
          offset: options.offset || 0,
          since: options.since
        }
      });
      
      return response.data.registrations;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get UnifiedID activity
   * @param {string} unifiedId - UnifiedID to get activity for
   * @param {number} chainId - Chain ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of activities
   */
  async getUnifiedIdActivity(unifiedId, chainId, options = {}) {
    // Validate parameters
    const validation = validateResolutionParams(unifiedId, chainId);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    try {
      const response = await this.sdk.httpClient.get(`/api/activity/${unifiedId}`, {
        params: {
          chainId,
          limit: options.limit || 50,
          offset: options.offset || 0,
          since: options.since,
          type: options.type
        }
      });
      
      return response.data.activities;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  UnifiedIdResolvers,
  // Pure validation functions
  validateResolutionParams,
  validateAddressResolutionParams,
  // Pure transformation functions
  transformUnifiedIdInfo,
  transformAddressResolution,
  transformMultiChainInfo
}; 