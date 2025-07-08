/**
 * @fileoverview UnifiedID Operations - Functional Programming Approach
 * @author kunalmkv
 * @version 1.0.0
 */

const R = require('ramda');
const { 
  createOperationId, 
  createDeadline, 
  isValidUnifiedId, 
  isValidAddress,
  createError,
  handleApiError 
} = require('../core/UnifiedIdSDK');

// ========================================
// PURE VALIDATION FUNCTIONS
// ========================================

/**
 * Pure function to validate register operation parameters
 * @param {Object} params - Register operation parameters
 * @returns {Object} Validation result
 */
const validateRegisterParams = (params) => {
  const errors = [];
  
  if (!isValidUnifiedId(params.unifiedId)) {
    errors.push('Invalid UnifiedID format');
  }
  
  if (!isValidAddress(params.primaryAddress)) {
    errors.push('Invalid primary address format');
  }
  
  if (!params.masterSignatureData || !params.primarySignatureData) {
    errors.push('Both master and primary signatures are required');
  }
  
  if (params.chainId === undefined || params.chainId === null) {
    errors.push('Chain ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Pure function to validate update operation parameters
 * @param {Object} params - Update operation parameters
 * @returns {Object} Validation result
 */
const validateUpdateParams = (params) => {
  const errors = [];
  
  if (!isValidUnifiedId(params.oldUnifiedId)) {
    errors.push('Invalid old UnifiedID format');
  }
  
  if (!isValidUnifiedId(params.newUnifiedId)) {
    errors.push('Invalid new UnifiedID format');
  }
  
  if (!params.masterSignatureData) {
    errors.push('Master signature is required');
  }
  
  if (params.chainId === undefined || params.chainId === null) {
    errors.push('Chain ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Pure function to validate update primary address parameters
 * @param {Object} params - Update primary address parameters
 * @returns {Object} Validation result
 */
const validateUpdatePrimaryParams = (params) => {
  const errors = [];
  
  if (!isValidUnifiedId(params.unifiedId)) {
    errors.push('Invalid UnifiedID format');
  }
  
  if (!isValidAddress(params.newPrimaryAddress)) {
    errors.push('Invalid new primary address format');
  }
  
  if (!params.currentPrimarySignatureData || !params.newPrimarySignatureData) {
    errors.push('Both current and new primary signatures are required');
  }
  
  if (params.chainId === undefined || params.chainId === null) {
    errors.push('Chain ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Pure function to validate add secondary address parameters
 * @param {Object} params - Add secondary address parameters
 * @returns {Object} Validation result
 */
const validateAddSecondaryParams = (params) => {
  const errors = [];
  
  if (!isValidUnifiedId(params.unifiedId)) {
    errors.push('Invalid UnifiedID format');
  }
  
  if (!isValidAddress(params.secondaryAddress)) {
    errors.push('Invalid secondary address format');
  }
  
  if (!params.primarySignatureData || !params.secondarySignatureData) {
    errors.push('Both primary and secondary signatures are required');
  }
  
  if (params.chainId === undefined || params.chainId === null) {
    errors.push('Chain ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Pure function to validate remove secondary address parameters
 * @param {Object} params - Remove secondary address parameters
 * @returns {Object} Validation result
 */
const validateRemoveSecondaryParams = (params) => {
  const errors = [];
  
  if (!isValidUnifiedId(params.unifiedId)) {
    errors.push('Invalid UnifiedID format');
  }
  
  if (!isValidAddress(params.secondaryAddress)) {
    errors.push('Invalid secondary address format');
  }
  
  if (!params.signatureData) {
    errors.push('Signature is required');
  }
  
  if (params.chainId === undefined || params.chainId === null) {
    errors.push('Chain ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========================================
// PURE OPERATION BUILDERS
// ========================================

/**
 * Pure function to build register operation payload
 * @param {Object} params - Register parameters
 * @returns {Object} Operation payload
 */
const buildRegisterPayload = (params) => ({
  unifiedId: params.unifiedId,
  primaryAddress: params.primaryAddress,
  masterSignatureData: params.masterSignatureData,
  primarySignatureData: params.primarySignatureData,
  chainId: params.chainId,
  targetChainId: params.targetChainId || params.chainId,
  priority: params.priority || 'normal'
});

/**
 * Pure function to build update operation payload
 * @param {Object} params - Update parameters
 * @returns {Object} Operation payload
 */
const buildUpdatePayload = (params) => ({
  oldUnifiedId: params.oldUnifiedId,
  newUnifiedId: params.newUnifiedId,
  masterSignatureData: params.masterSignatureData,
  chainId: params.chainId,
  targetChainId: params.targetChainId || params.chainId,
  priority: params.priority || 'normal'
});

/**
 * Pure function to build update primary address payload
 * @param {Object} params - Update primary address parameters
 * @returns {Object} Operation payload
 */
const buildUpdatePrimaryPayload = (params) => ({
  unifiedId: params.unifiedId,
  newPrimaryAddress: params.newPrimaryAddress,
  currentPrimarySignatureData: params.currentPrimarySignatureData,
  newPrimarySignatureData: params.newPrimarySignatureData,
  chainId: params.chainId,
  targetChainId: params.targetChainId || params.chainId,
  priority: params.priority || 'normal'
});

/**
 * Pure function to build add secondary address payload
 * @param {Object} params - Add secondary address parameters
 * @returns {Object} Operation payload
 */
const buildAddSecondaryPayload = (params) => ({
  unifiedId: params.unifiedId,
  secondaryAddress: params.secondaryAddress,
  primarySignatureData: params.primarySignatureData,
  secondarySignatureData: params.secondarySignatureData,
  chainId: params.chainId,
  targetChainId: params.targetChainId || params.chainId,
  priority: params.priority || 'normal'
});

/**
 * Pure function to build remove secondary address payload
 * @param {Object} params - Remove secondary address parameters
 * @returns {Object} Operation payload
 */
const buildRemoveSecondaryPayload = (params) => ({
  unifiedId: params.unifiedId,
  secondaryAddress: params.secondaryAddress,
  signatureData: params.signatureData,
  chainId: params.chainId,
  targetChainId: params.targetChainId || params.chainId,
  priority: params.priority || 'normal'
});

// ========================================
// OPERATION CLASS
// ========================================

class UnifiedIdOperations {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Register UnifiedID
   * @param {Object} params - Registration parameters
   * @returns {Promise<Object>} Operation result
   */
  async registerUnifiedId(params) {
    // Validate parameters
    const validation = validateRegisterParams(params);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    // Build payload
    const payload = buildRegisterPayload(params);
    const operationId = createOperationId('register', params.unifiedId);

    try {
      this.sdk.emit('operation:started', { operationId, type: 'register', params });

      const response = await this.sdk.httpClient.post('/api/register', payload);
      
      const result = {
        success: true,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        data: response.data
      };

      this.sdk.emit('operation:completed', { operationId, type: 'register', result });
      return result;

    } catch (error) {
      const errorResult = {
        success: false,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        error: handleApiError(error)
      };

      this.sdk.emit('operation:failed', { operationId, type: 'register', error: errorResult.error });
      throw errorResult.error;
    }
  }

  /**
   * Update UnifiedID
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Operation result
   */
  async updateUnifiedId(params) {
    // Validate parameters
    const validation = validateUpdateParams(params);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    // Build payload
    const payload = buildUpdatePayload(params);
    const operationId = createOperationId('update', params.oldUnifiedId);

    try {
      this.sdk.emit('operation:started', { operationId, type: 'update', params });

      const response = await this.sdk.httpClient.post('/api/update', payload);
      
      const result = {
        success: true,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        data: response.data
      };

      this.sdk.emit('operation:completed', { operationId, type: 'update', result });
      return result;

    } catch (error) {
      const errorResult = {
        success: false,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        error: handleApiError(error)
      };

      this.sdk.emit('operation:failed', { operationId, type: 'update', error: errorResult.error });
      throw errorResult.error;
    }
  }

  /**
   * Update primary address
   * @param {Object} params - Update primary address parameters
   * @returns {Promise<Object>} Operation result
   */
  async updatePrimaryAddress(params) {
    // Validate parameters
    const validation = validateUpdatePrimaryParams(params);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    // Build payload
    const payload = buildUpdatePrimaryPayload(params);
    const operationId = createOperationId('update-primary', params.unifiedId);

    try {
      this.sdk.emit('operation:started', { operationId, type: 'update-primary', params });

      const response = await this.sdk.httpClient.post('/api/update-primary', payload);
      
      const result = {
        success: true,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        data: response.data
      };

      this.sdk.emit('operation:completed', { operationId, type: 'update-primary', result });
      return result;

    } catch (error) {
      const errorResult = {
        success: false,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        error: handleApiError(error)
      };

      this.sdk.emit('operation:failed', { operationId, type: 'update-primary', error: errorResult.error });
      throw errorResult.error;
    }
  }

  /**
   * Add secondary address
   * @param {Object} params - Add secondary address parameters
   * @returns {Promise<Object>} Operation result
   */
  async addSecondaryAddress(params) {
    // Validate parameters
    const validation = validateAddSecondaryParams(params);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    // Build payload
    const payload = buildAddSecondaryPayload(params);
    const operationId = createOperationId('add-secondary', params.unifiedId);

    try {
      this.sdk.emit('operation:started', { operationId, type: 'add-secondary', params });

      const response = await this.sdk.httpClient.post('/api/add-secondary', payload);
      
      const result = {
        success: true,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        data: response.data
      };

      this.sdk.emit('operation:completed', { operationId, type: 'add-secondary', result });
      return result;

    } catch (error) {
      const errorResult = {
        success: false,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        error: handleApiError(error)
      };

      this.sdk.emit('operation:failed', { operationId, type: 'add-secondary', error: errorResult.error });
      throw errorResult.error;
    }
  }

  /**
   * Remove secondary address
   * @param {Object} params - Remove secondary address parameters
   * @returns {Promise<Object>} Operation result
   */
  async removeSecondaryAddress(params) {
    // Validate parameters
    const validation = validateRemoveSecondaryParams(params);
    if (!validation.isValid) {
      throw createError('VALIDATION_ERROR', 'Invalid parameters', { errors: validation.errors });
    }

    // Build payload
    const payload = buildRemoveSecondaryPayload(params);
    const operationId = createOperationId('remove-secondary', params.unifiedId);

    try {
      this.sdk.emit('operation:started', { operationId, type: 'remove-secondary', params });

      const response = await this.sdk.httpClient.post('/api/remove-secondary', payload);
      
      const result = {
        success: true,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        data: response.data
      };

      this.sdk.emit('operation:completed', { operationId, type: 'remove-secondary', result });
      return result;

    } catch (error) {
      const errorResult = {
        success: false,
        operationId,
        timestamp: Date.now(),
        chainId: params.chainId,
        error: handleApiError(error)
      };

      this.sdk.emit('operation:failed', { operationId, type: 'remove-secondary', error: errorResult.error });
      throw errorResult.error;
    }
  }

  /**
   * Get operation status
   * @param {string} operationId - Operation ID
   * @returns {Promise<Object>} Operation details
   */
  async getOperation(operationId) {
    try {
      const response = await this.sdk.httpClient.get(`/api/operation/${operationId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get operations by UnifiedID
   * @param {string} unifiedId - UnifiedID
   * @returns {Promise<Array>} Array of operations
   */
  async getOperationsByUnifiedId(unifiedId) {
    try {
      const response = await this.sdk.httpClient.get(`/api/operations/${unifiedId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Cancel operation
   * @param {string} operationId - Operation ID
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelOperation(operationId) {
    try {
      const response = await this.sdk.httpClient.post(`/api/operation/${operationId}/cancel`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Retry operation
   * @param {string} operationId - Operation ID
   * @returns {Promise<Object>} Retry result
   */
  async retryOperation(operationId) {
    try {
      const response = await this.sdk.httpClient.post(`/api/operation/${operationId}/retry`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Batch operations
   * @param {Array} operations - Array of operations
   * @returns {Promise<Array>} Array of operation results
   */
  async batchOperations(operations) {
    const results = [];
    
    for (const operation of operations) {
      try {
        let result;
        
        switch (operation.type) {
          case 'register':
            result = await this.registerUnifiedId(operation.params);
            break;
          case 'update':
            result = await this.updateUnifiedId(operation.params);
            break;
          case 'update-primary':
            result = await this.updatePrimaryAddress(operation.params);
            break;
          case 'add-secondary':
            result = await this.addSecondaryAddress(operation.params);
            break;
          case 'remove-secondary':
            result = await this.removeSecondaryAddress(operation.params);
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
        
        results.push({ success: true, operation, result });
      } catch (error) {
        results.push({ success: false, operation, error });
      }
    }
    
    return results;
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  UnifiedIdOperations,
  // Pure validation functions
  validateRegisterParams,
  validateUpdateParams,
  validateUpdatePrimaryParams,
  validateAddSecondaryParams,
  validateRemoveSecondaryParams,
  // Pure builder functions
  buildRegisterPayload,
  buildUpdatePayload,
  buildUpdatePrimaryPayload,
  buildAddSecondaryPayload,
  buildRemoveSecondaryPayload
}; 