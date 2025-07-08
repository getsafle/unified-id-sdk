/**
 * @fileoverview EIP-712 Signature Utilities for UnifiedID
 * @author kunalmkv
 * @version 1.0.0
 */

const { ethers } = require('ethers');
const R = require('ramda');

// ========================================
// CONSTANTS
// ========================================

const DOMAIN_TYPES = {
  name: 'string',
  version: 'string',
  chainId: 'uint256',
  verifyingContract: 'address'
};

const ENHANCED_TYPES = {
  RegisterUnifiedId: [
    { name: 'unifiedId', type: 'string' },
    { name: 'primaryAddress', type: 'address' },
    { name: 'targetChainId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  UpdateUnifiedId: [
    { name: 'oldUnifiedId', type: 'string' },
    { name: 'newUnifiedId', type: 'string' },
    { name: 'targetChainId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  UpdatePrimaryAddress: [
    { name: 'unifiedId', type: 'string' },
    { name: 'newPrimaryAddress', type: 'address' },
    { name: 'targetChainId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  AddSecondaryAddress: [
    { name: 'unifiedId', type: 'string' },
    { name: 'secondaryAddress', type: 'address' },
    { name: 'targetChainId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  RemoveSecondaryAddress: [
    { name: 'unifiedId', type: 'string' },
    { name: 'secondaryAddress', type: 'address' },
    { name: 'targetChainId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  UpdateMasterAddress: [
    { name: 'unifiedId', type: 'string' },
    { name: 'newMasterAddress', type: 'address' },
    { name: 'targetChainId', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

const LEGACY_TYPES = {
  RegisterUnifiedId: [
    { name: 'unifiedId', type: 'string' },
    { name: 'primaryAddress', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  UpdateUnifiedId: [
    { name: 'oldUnifiedId', type: 'string' },
    { name: 'newUnifiedId', type: 'string' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  UpdatePrimaryAddress: [
    { name: 'unifiedId', type: 'string' },
    { name: 'newPrimaryAddress', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  AddSecondaryAddress: [
    { name: 'unifiedId', type: 'string' },
    { name: 'secondaryAddress', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  RemoveSecondaryAddress: [
    { name: 'unifiedId', type: 'string' },
    { name: 'secondaryAddress', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  UpdateMasterAddress: [
    { name: 'unifiedId', type: 'string' },
    { name: 'newMasterAddress', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

// ========================================
// PURE UTILITY FUNCTIONS
// ========================================

/**
 * Pure function to create domain separator
 * @param {string} contractAddress - Contract address
 * @param {number} chainId - Chain ID
 * @param {string} name - Domain name
 * @param {string} version - Domain version
 * @returns {Object} Domain configuration
 */
const createDomain = (contractAddress, chainId, name = "UnifiedID", version = "1") => ({
  name,
  version,
  chainId,
  verifyingContract: contractAddress
});

/**
 * Pure function to validate signature data
 * @param {Object} signatureData - Signature data to validate
 * @returns {boolean} Whether signature data is valid
 */
const validateSignatureData = (signatureData) => {
  if (!signatureData || typeof signatureData !== 'object') return false;
  
  const requiredFields = ['signature', 'deadline', 'nonce'];
  return requiredFields.every(field => 
    signatureData[field] !== undefined && signatureData[field] !== null
  );
};

/**
 * Pure function to validate enhanced signature data
 * @param {Object} signatureData - Enhanced signature data to validate
 * @returns {boolean} Whether enhanced signature data is valid
 */
const validateEnhancedSignatureData = (signatureData) => {
  if (!validateSignatureData(signatureData)) return false;
  return signatureData.targetChainId !== undefined && signatureData.targetChainId !== null;
};

/**
 * Pure function to check if signature is expired
 * @param {number} deadline - Signature deadline
 * @returns {boolean} Whether signature is expired
 */
const isSignatureExpired = (deadline) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime > deadline;
};

/**
 * Pure function to verify signature chain compatibility
 * @param {Object} signatureData - Signature data
 * @param {number} expectedChainId - Expected chain ID
 * @returns {boolean} Whether signature is compatible with chain
 */
const verifySignatureChainCompatibility = (signatureData, expectedChainId) => {
  if (!validateEnhancedSignatureData(signatureData)) return false;
  return signatureData.targetChainId === expectedChainId;
};

/**
 * Pure function to create deadline timestamp
 * @param {number} minutesFromNow - Minutes from now
 * @returns {number} Deadline timestamp
 */
const createDeadline = (minutesFromNow = 30) => 
  Math.floor(Date.now() / 1000) + (minutesFromNow * 60);

/**
 * Pure function to upgrade legacy signature to enhanced signature
 * @param {Object} legacySignature - Legacy signature data
 * @param {number} targetChainId - Target chain ID
 * @returns {Object} Enhanced signature data
 */
const upgradeToEnhancedSignature = (legacySignature, targetChainId) => ({
  ...legacySignature,
  targetChainId
});

// ========================================
// SIGNATURE CREATION FUNCTIONS
// ========================================

/**
 * Pure function to sign data using EIP-712
 * @param {Object} signer - Ethers signer instance
 * @param {Object} domain - Domain configuration
 * @param {string} typeName - Type name
 * @param {Object} data - Data to sign
 * @param {number} targetChainId - Target chain ID
 * @param {boolean} useLegacyTypes - Whether to use legacy types
 * @returns {Promise<Object>} Signature data
 */
const signEnhancedData = async (signer, domain, typeName, data, targetChainId, useLegacyTypes = false) => {
  const types = useLegacyTypes ? LEGACY_TYPES : ENHANCED_TYPES;
  
  if (!types[typeName]) {
    throw new Error(`Unknown type: ${typeName}`);
  }

  // Validate target chain ID matches domain chain ID for enhanced types
  if (!useLegacyTypes && targetChainId !== domain.chainId) {
    throw new Error(`Target chain ID ${targetChainId} does not match domain chain ID ${domain.chainId}`);
  }

  // Prepare data with target chain ID if using enhanced types
  let signData = { ...data };
  if (!useLegacyTypes) {
    signData.targetChainId = targetChainId;
  }

  // Validate required fields
  const requiredFields = types[typeName].map(field => field.name);
  for (const field of requiredFields) {
    if (signData[field] === undefined || signData[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const signature = await signer._signTypedData(domain, { [typeName]: types[typeName] }, signData);

  return {
    nonce: signData.nonce,
    deadline: signData.deadline,
    targetChainId: targetChainId,
    signature: signature
  };
};

/**
 * Pure function to sign legacy data
 * @param {Object} signer - Ethers signer instance
 * @param {Object} domain - Domain configuration
 * @param {string} typeName - Type name
 * @param {Object} data - Data to sign
 * @returns {Promise<Object>} Legacy signature data
 */
const signLegacyData = (signer, domain, typeName, data) => 
  signEnhancedData(signer, domain, typeName, data, domain.chainId, true);

// ========================================
// SPECIFIC SIGNATURE CREATION FUNCTIONS
// ========================================

/**
 * Create register UnifiedID signature
 * @param {Object} signer - Ethers signer
 * @param {Object} domain - Domain configuration
 * @param {string} unifiedId - UnifiedID to register
 * @param {string} primaryAddress - Primary address
 * @param {number} targetChainId - Target chain ID
 * @param {number} nonce - Nonce
 * @param {number} deadline - Deadline
 * @param {boolean} useLegacyTypes - Whether to use legacy types
 * @returns {Promise<Object>} Signature data
 */
const createRegisterSignature = async (signer, domain, unifiedId, primaryAddress, targetChainId, nonce, deadline, useLegacyTypes = false) => {
  const data = {
    unifiedId,
    primaryAddress,
    nonce,
    deadline
  };
  
  return signEnhancedData(signer, domain, 'RegisterUnifiedId', data, targetChainId, useLegacyTypes);
};

/**
 * Create update UnifiedID signature
 * @param {Object} signer - Ethers signer
 * @param {Object} domain - Domain configuration
 * @param {string} oldUnifiedId - Old UnifiedID
 * @param {string} newUnifiedId - New UnifiedID
 * @param {number} targetChainId - Target chain ID
 * @param {number} nonce - Nonce
 * @param {number} deadline - Deadline
 * @param {boolean} useLegacyTypes - Whether to use legacy types
 * @returns {Promise<Object>} Signature data
 */
const createUpdateUnifiedIdSignature = async (signer, domain, oldUnifiedId, newUnifiedId, targetChainId, nonce, deadline, useLegacyTypes = false) => {
  const data = {
    oldUnifiedId,
    newUnifiedId,
    nonce,
    deadline
  };
  
  return signEnhancedData(signer, domain, 'UpdateUnifiedId', data, targetChainId, useLegacyTypes);
};

/**
 * Create update primary address signature
 * @param {Object} signer - Ethers signer
 * @param {Object} domain - Domain configuration
 * @param {string} unifiedId - UnifiedID
 * @param {string} newPrimaryAddress - New primary address
 * @param {number} targetChainId - Target chain ID
 * @param {number} nonce - Nonce
 * @param {number} deadline - Deadline
 * @param {boolean} useLegacyTypes - Whether to use legacy types
 * @returns {Promise<Object>} Signature data
 */
const createUpdatePrimarySignature = async (signer, domain, unifiedId, newPrimaryAddress, targetChainId, nonce, deadline, useLegacyTypes = false) => {
  const data = {
    unifiedId,
    newPrimaryAddress,
    nonce,
    deadline
  };
  
  return signEnhancedData(signer, domain, 'UpdatePrimaryAddress', data, targetChainId, useLegacyTypes);
};

/**
 * Create add secondary address signature
 * @param {Object} signer - Ethers signer
 * @param {Object} domain - Domain configuration
 * @param {string} unifiedId - UnifiedID
 * @param {string} secondaryAddress - Secondary address
 * @param {number} targetChainId - Target chain ID
 * @param {number} nonce - Nonce
 * @param {number} deadline - Deadline
 * @param {boolean} useLegacyTypes - Whether to use legacy types
 * @returns {Promise<Object>} Signature data
 */
const createAddSecondarySignature = async (signer, domain, unifiedId, secondaryAddress, targetChainId, nonce, deadline, useLegacyTypes = false) => {
  const data = {
    unifiedId,
    secondaryAddress,
    nonce,
    deadline
  };
  
  return signEnhancedData(signer, domain, 'AddSecondaryAddress', data, targetChainId, useLegacyTypes);
};

/**
 * Create remove secondary address signature
 * @param {Object} signer - Ethers signer
 * @param {Object} domain - Domain configuration
 * @param {string} unifiedId - UnifiedID
 * @param {string} secondaryAddress - Secondary address
 * @param {number} targetChainId - Target chain ID
 * @param {number} nonce - Nonce
 * @param {number} deadline - Deadline
 * @param {boolean} useLegacyTypes - Whether to use legacy types
 * @returns {Promise<Object>} Signature data
 */
const createRemoveSecondarySignature = async (signer, domain, unifiedId, secondaryAddress, targetChainId, nonce, deadline, useLegacyTypes = false) => {
  const data = {
    unifiedId,
    secondaryAddress,
    nonce,
    deadline
  };
  
  return signEnhancedData(signer, domain, 'RemoveSecondaryAddress', data, targetChainId, useLegacyTypes);
};

/**
 * Create update master address signature
 * @param {Object} signer - Ethers signer
 * @param {Object} domain - Domain configuration
 * @param {string} unifiedId - UnifiedID
 * @param {string} newMasterAddress - New master address
 * @param {number} targetChainId - Target chain ID
 * @param {number} nonce - Nonce
 * @param {number} deadline - Deadline
 * @param {boolean} useLegacyTypes - Whether to use legacy types
 * @returns {Promise<Object>} Signature data
 */
const createUpdateMasterSignature = async (signer, domain, unifiedId, newMasterAddress, targetChainId, nonce, deadline, useLegacyTypes = false) => {
  const data = {
    unifiedId,
    newMasterAddress,
    nonce,
    deadline
  };
  
  return signEnhancedData(signer, domain, 'UpdateMasterAddress', data, targetChainId, useLegacyTypes);
};

// ========================================
// BATCH SIGNATURE FUNCTIONS
// ========================================

/**
 * Create multiple signatures in batch
 * @param {Object} signer - Ethers signer
 * @param {Object} domain - Domain configuration
 * @param {Array} operations - Array of operations to sign
 * @param {number} targetChainId - Target chain ID
 * @param {number} deadline - Deadline
 * @param {boolean} useLegacyTypes - Whether to use legacy types
 * @returns {Promise<Array>} Array of signature data
 */
const batchCreateSignatures = async (signer, domain, operations, targetChainId, deadline, useLegacyTypes = false) => {
  const signatures = [];
  
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];
    const nonce = operation.nonce || i;
    
    let signatureData;
    
    switch (operation.type) {
      case 'RegisterUnifiedId':
        signatureData = await createRegisterSignature(
          signer, domain, operation.unifiedId, operation.primaryAddress, 
          targetChainId, nonce, deadline, useLegacyTypes
        );
        break;
        
      case 'UpdateUnifiedId':
        signatureData = await createUpdateUnifiedIdSignature(
          signer, domain, operation.oldUnifiedId, operation.newUnifiedId,
          targetChainId, nonce, deadline, useLegacyTypes
        );
        break;
        
      case 'UpdatePrimaryAddress':
        signatureData = await createUpdatePrimarySignature(
          signer, domain, operation.unifiedId, operation.newPrimaryAddress,
          targetChainId, nonce, deadline, useLegacyTypes
        );
        break;
        
      case 'AddSecondaryAddress':
        signatureData = await createAddSecondarySignature(
          signer, domain, operation.unifiedId, operation.secondaryAddress,
          targetChainId, nonce, deadline, useLegacyTypes
        );
        break;
        
      case 'RemoveSecondaryAddress':
        signatureData = await createRemoveSecondarySignature(
          signer, domain, operation.unifiedId, operation.secondaryAddress,
          targetChainId, nonce, deadline, useLegacyTypes
        );
        break;
        
      case 'UpdateMasterAddress':
        signatureData = await createUpdateMasterSignature(
          signer, domain, operation.unifiedId, operation.newMasterAddress,
          targetChainId, nonce, deadline, useLegacyTypes
        );
        break;
        
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
    
    signatures.push({
      type: operation.type,
      data: signatureData,
      operation: operation
    });
  }
  
  return signatures;
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Constants
  DOMAIN_TYPES,
  ENHANCED_TYPES,
  LEGACY_TYPES,
  
  // Pure utility functions
  createDomain,
  validateSignatureData,
  validateEnhancedSignatureData,
  isSignatureExpired,
  verifySignatureChainCompatibility,
  createDeadline,
  upgradeToEnhancedSignature,
  
  // Core signature functions
  signEnhancedData,
  signLegacyData,
  
  // Specific signature creation functions
  createRegisterSignature,
  createUpdateUnifiedIdSignature,
  createUpdatePrimarySignature,
  createAddSecondarySignature,
  createRemoveSecondarySignature,
  createUpdateMasterSignature,
  
  // Batch functions
  batchCreateSignatures
}; 