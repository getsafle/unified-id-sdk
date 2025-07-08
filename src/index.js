/**
 * @fileoverview UnifiedID SDK - Main Entry Point
 * @author kunalmkv
 * @version 1.0.0
 */

const { UnifiedIdSDK, SUPPORTED_CHAINS, DEFAULT_CONFIG } = require('./core/UnifiedIdSDK');
const { UnifiedIdOperations } = require('./operations/Operations');
const { UnifiedIdResolvers } = require('./resolvers/Resolvers');
const SignatureUtils = require('./signatures/SignatureUtils');

// ========================================
// MAIN SDK CLASS WITH INTEGRATED MODULES
// ========================================

class UnifiedID {
  constructor(config = {}) {
    // Initialize core SDK
    this.sdk = new UnifiedIdSDK(config);
    
    // Initialize modules
    this.operations = new UnifiedIdOperations(this.sdk);
    this.resolvers = new UnifiedIdResolvers(this.sdk);
    
    // Expose core SDK methods
    this.healthCheck = this.sdk.healthCheck.bind(this.sdk);
    this.getStats = this.sdk.getStats.bind(this.sdk);
    this.getQueueStatus = this.sdk.getQueueStatus.bind(this.sdk);
    this.validateConfig = this.sdk.validateConfig.bind(this.sdk);
    this.getSupportedChains = this.sdk.getSupportedChains.bind(this.sdk);
    this.isChainSupported = this.sdk.isChainSupported.bind(this.sdk);
    this.setSigner = this.sdk.setSigner.bind(this.sdk);
    this.getProvider = this.sdk.getProvider.bind(this.sdk);
    this.on = this.sdk.on.bind(this.sdk);
    this.off = this.sdk.off.bind(this.sdk);
    this.emit = this.sdk.emit.bind(this.sdk);
    
    // Expose configuration
    this.config = this.sdk.config;
    this.logger = this.sdk.logger;
  }

  // ========================================
  // CONVENIENCE METHODS
  // ========================================

  /**
   * Register UnifiedID with automatic signature creation
   * @param {Object} params - Registration parameters
   * @returns {Promise<Object>} Registration result
   */
  async registerUnifiedId(params) {
    if (!this.sdk.signer) {
      throw new Error('Signer is required for registration. Call setSigner() first.');
    }

    // Create signatures if not provided
    if (!params.masterSignatureData || !params.primarySignatureData) {
      const domain = SignatureUtils.createDomain(
        this.config.contractAddresses.mother[params.chainId],
        params.chainId
      );

      const deadline = SignatureUtils.createDeadline(30);
      const nonce = Date.now();

      if (!params.masterSignatureData) {
        params.masterSignatureData = await SignatureUtils.createRegisterSignature(
          this.sdk.signer,
          domain,
          params.unifiedId,
          params.primaryAddress,
          params.chainId,
          nonce,
          deadline
        );
      }

      if (!params.primarySignatureData) {
        params.primarySignatureData = await SignatureUtils.createRegisterSignature(
          this.sdk.signer,
          domain,
          params.unifiedId,
          params.primaryAddress,
          params.chainId,
          nonce + 1,
          deadline
        );
      }
    }

    return this.operations.registerUnifiedId(params);
  }

  /**
   * Update UnifiedID with automatic signature creation
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Update result
   */
  async updateUnifiedId(params) {
    if (!this.sdk.signer) {
      throw new Error('Signer is required for updates. Call setSigner() first.');
    }

    // Create signature if not provided
    if (!params.masterSignatureData) {
      const domain = SignatureUtils.createDomain(
        this.config.contractAddresses.mother[params.chainId],
        params.chainId
      );

      const deadline = SignatureUtils.createDeadline(30);
      const nonce = Date.now();

      params.masterSignatureData = await SignatureUtils.createUpdateUnifiedIdSignature(
        this.sdk.signer,
        domain,
        params.oldUnifiedId,
        params.newUnifiedId,
        params.chainId,
        nonce,
        deadline
      );
    }

    return this.operations.updateUnifiedId(params);
  }

  /**
   * Update primary address with automatic signature creation
   * @param {Object} params - Update primary address parameters
   * @returns {Promise<Object>} Update result
   */
  async updatePrimaryAddress(params) {
    if (!this.sdk.signer) {
      throw new Error('Signer is required for updates. Call setSigner() first.');
    }

    // Create signatures if not provided
    if (!params.currentPrimarySignatureData || !params.newPrimarySignatureData) {
      const domain = SignatureUtils.createDomain(
        this.config.contractAddresses.mother[params.chainId],
        params.chainId
      );

      const deadline = SignatureUtils.createDeadline(30);
      const nonce = Date.now();

      if (!params.currentPrimarySignatureData) {
        params.currentPrimarySignatureData = await SignatureUtils.createUpdatePrimarySignature(
          this.sdk.signer,
          domain,
          params.unifiedId,
          params.newPrimaryAddress,
          params.chainId,
          nonce,
          deadline
        );
      }

      if (!params.newPrimarySignatureData) {
        params.newPrimarySignatureData = await SignatureUtils.createUpdatePrimarySignature(
          this.sdk.signer,
          domain,
          params.unifiedId,
          params.newPrimaryAddress,
          params.chainId,
          nonce + 1,
          deadline
        );
      }
    }

    return this.operations.updatePrimaryAddress(params);
  }

  /**
   * Add secondary address with automatic signature creation
   * @param {Object} params - Add secondary address parameters
   * @returns {Promise<Object>} Add result
   */
  async addSecondaryAddress(params) {
    if (!this.sdk.signer) {
      throw new Error('Signer is required for adding secondary addresses. Call setSigner() first.');
    }

    // Create signatures if not provided
    if (!params.primarySignatureData || !params.secondarySignatureData) {
      const domain = SignatureUtils.createDomain(
        this.config.contractAddresses.mother[params.chainId],
        params.chainId
      );

      const deadline = SignatureUtils.createDeadline(30);
      const nonce = Date.now();

      if (!params.primarySignatureData) {
        params.primarySignatureData = await SignatureUtils.createAddSecondarySignature(
          this.sdk.signer,
          domain,
          params.unifiedId,
          params.secondaryAddress,
          params.chainId,
          nonce,
          deadline
        );
      }

      if (!params.secondarySignatureData) {
        params.secondarySignatureData = await SignatureUtils.createAddSecondarySignature(
          this.sdk.signer,
          domain,
          params.unifiedId,
          params.secondaryAddress,
          params.chainId,
          nonce + 1,
          deadline
        );
      }
    }

    return this.operations.addSecondaryAddress(params);
  }

  /**
   * Remove secondary address with automatic signature creation
   * @param {Object} params - Remove secondary address parameters
   * @returns {Promise<Object>} Remove result
   */
  async removeSecondaryAddress(params) {
    if (!this.sdk.signer) {
      throw new Error('Signer is required for removing secondary addresses. Call setSigner() first.');
    }

    // Create signature if not provided
    if (!params.signatureData) {
      const domain = SignatureUtils.createDomain(
        this.config.contractAddresses.mother[params.chainId],
        params.chainId
      );

      const deadline = SignatureUtils.createDeadline(30);
      const nonce = Date.now();

      params.signatureData = await SignatureUtils.createRemoveSecondarySignature(
        this.sdk.signer,
        domain,
        params.unifiedId,
        params.secondaryAddress,
        params.chainId,
        nonce,
        deadline
      );
    }

    return this.operations.removeSecondaryAddress(params);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Create deadline timestamp
   * @param {number} minutesFromNow - Minutes from now
   * @returns {number} Deadline timestamp
   */
  createDeadline(minutesFromNow = 30) {
    return SignatureUtils.createDeadline(minutesFromNow);
  }

  /**
   * Validate UnifiedID format
   * @param {string} unifiedId - UnifiedID to validate
   * @returns {boolean} Whether UnifiedID is valid
   */
  isValidUnifiedId(unifiedId) {
    return this.sdk.isValidUnifiedId(unifiedId);
  }

  /**
   * Validate Ethereum address
   * @param {string} address - Address to validate
   * @returns {boolean} Whether address is valid
   */
  isValidAddress(address) {
    return this.sdk.isValidAddress(address);
  }

  /**
   * Create domain for signatures
   * @param {string} contractAddress - Contract address
   * @param {number} chainId - Chain ID
   * @param {string} name - Domain name
   * @param {string} version - Domain version
   * @returns {Object} Domain configuration
   */
  createDomain(contractAddress, chainId, name = "UnifiedID", version = "1") {
    return SignatureUtils.createDomain(contractAddress, chainId, name, version);
  }

  /**
   * Batch create signatures
   * @param {Array} operations - Array of operations to sign
   * @param {number} targetChainId - Target chain ID
   * @param {number} deadline - Deadline
   * @param {boolean} useLegacyTypes - Whether to use legacy types
   * @returns {Promise<Array>} Array of signature data
   */
  async batchCreateSignatures(operations, targetChainId, deadline, useLegacyTypes = false) {
    if (!this.sdk.signer) {
      throw new Error('Signer is required for signature creation. Call setSigner() first.');
    }

    const domain = SignatureUtils.createDomain(
      this.config.contractAddresses.mother[targetChainId],
      targetChainId
    );

    return SignatureUtils.batchCreateSignatures(
      this.sdk.signer,
      domain,
      operations,
      targetChainId,
      deadline,
      useLegacyTypes
    );
  }

  // ========================================
  // EXPOSE MODULES
  // ========================================

  /**
   * Get operations module
   * @returns {UnifiedIdOperations} Operations module
   */
  getOperations() {
    return this.operations;
  }

  /**
   * Get resolvers module
   * @returns {UnifiedIdResolvers} Resolvers module
   */
  getResolvers() {
    return this.resolvers;
  }

  /**
   * Get signature utilities
   * @returns {Object} Signature utilities
   */
  getSignatureUtils() {
    return SignatureUtils;
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Main SDK class
  UnifiedID,
  
  // Core SDK
  UnifiedIdSDK,
  
  // Modules
  UnifiedIdOperations,
  UnifiedIdResolvers,
  
  // Utilities
  SignatureUtils,
  
  // Constants
  SUPPORTED_CHAINS,
  DEFAULT_CONFIG,
  
  // Default export
  default: UnifiedID
}; 