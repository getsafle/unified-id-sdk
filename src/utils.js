const { ethers } = require('ethers');
const MOTHER_CONTRACT_ABI = require('./abis/mother-contract-abi.json');
const CHILD_CONTRACT_ABI = require('./abis/child-contract-abi.json');
const STORAGE_UTIL_ABI = require('./abis/registrar-storage-util.json');
const { CHILD_CONTRACT_ADDRESS_MAP, STORAGE_UTIL_CONTRACT_ADDRESS_MAP } = require('./config');

/**
 * Get provider for the specified network
 * @param {string} rpcUrl - RPC URL for the network
 * @returns {Object} Ethers provider
 */
const getProvider = (rpcUrl) => {
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

/**
 * Get mother contract instance
 * @param {string} contractAddress - Mother contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Object} Mother contract instance
 */
const getMotherContract = (contractAddress, rpcUrl) => {
  const provider = getProvider(rpcUrl);
  // Handle Hardhat artifact format
  const abi = MOTHER_CONTRACT_ABI.abi || MOTHER_CONTRACT_ABI;
  return new ethers.Contract(contractAddress, abi, provider);
};

/**
 * Get child contract instance
 * @param {string} contractAddress - Child contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Object} Child contract instance
 */
const getChildContract = (contractAddress, rpcUrl) => {
  const provider = getProvider(rpcUrl);
  // Handle Hardhat artifact format
  const abi = CHILD_CONTRACT_ABI.abi || CHILD_CONTRACT_ABI;
  return new ethers.Contract(contractAddress, abi, provider);
};

/**
 * Get storage util contract instance
 * @param {string} contractAddress - Storage util contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Object} Storage util contract instance
 */
const getStorageUtilContract = (contractAddress, rpcUrl) => {
  const provider = getProvider(rpcUrl);
  // Handle Hardhat artifact format
  const abi = STORAGE_UTIL_ABI.abi || STORAGE_UTIL_ABI;
  return new ethers.Contract(contractAddress, abi, provider);
};


/**
 * Resolve any address to unified ID and get role information
 * @param {string} addressToCheck - Address to check
 * @param {string} contractAddress - Child contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<Object>} Result with unifiedId, isPrimary, and isSecondary flags
 */
const resolveAnyAddressToUnifiedId = async (addressToCheck, contractAddress, rpcUrl) => {
  if (!addressToCheck) {
    throw new Error("addressToCheck is required in resolveAnyAddressToUnifiedId");
  }
  
  try {
    const childContract = getChildContract(contractAddress, rpcUrl);
    const result = await childContract.resolveAnyAddressToUnifiedId(addressToCheck);
    return {
      unifiedId: result.unifiedId,
      isPrimary: result.isPrimary,
      isSecondary: result.isSecondary
    };
  } catch (error) {
    throw new Error(`Failed to resolve address to unified ID: ${error.message}`);
  }
};

/**
 * Check if an address is already registered as a primary address
 * @param {string} addressToCheck - Address to check
 * @param {string} contractAddress - Child contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<boolean>} True if address is registered as primary
 */
const isPrimaryAddressAlreadyRegistered = async (addressToCheck, contractAddress, rpcUrl) => {
  if (!addressToCheck) {
    throw new Error("addressToCheck is required in isPrimaryAddressAlreadyRegistered");
  }
  
  try {
    const result = await resolveAnyAddressToUnifiedId(addressToCheck, contractAddress, rpcUrl);
    return result.isPrimary;
  } catch (error) {
    // If the address is not found, it's not registered as primary
    if (error.message.includes("Failed to resolve address to unified ID")) {
      return false;
    }
    throw error;
  }
};

/**
 * Check if an address is already registered as a secondary address
 * @param {string} addressToCheck - Address to check
 * @param {string} contractAddress - Child contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<boolean>} True if address is registered as secondary
 */
const isSecondaryAddressAlreadyRegistered = async (addressToCheck, contractAddress, rpcUrl) => {
  if (!addressToCheck) {
    throw new Error("addressToCheck is required in isSecondaryAddressAlreadyRegistered");
  }
  
  try {
    const result = await resolveAnyAddressToUnifiedId(addressToCheck, contractAddress, rpcUrl);
    return result.isSecondary;
  } catch (error) {
    // If the address is not found, it's not registered as secondary
    if (error.message.includes("Failed to resolve address to unified ID")) {
      return false;
    }
    throw error;
  }
};

/**
 * Check if a unified ID is already registered using mother contract
 * @param {string} unifiedId - Unified ID to check
 * @param {string} contractAddress - Mother contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<boolean>} True if unified ID is already registered
 */
const isUnifiedIDAlreadyRegistered = async (unifiedId, contractAddress, rpcUrl) => {
  if (!unifiedId) {
    throw new Error("unifiedId is required in isUnifiedIDAlreadyRegistered");
  }
  
  try {
    const motherContract = getMotherContract(contractAddress, rpcUrl);
    const masterAddress = await motherContract.getMasterAddress(unifiedId);
    return masterAddress !== "0x0000000000000000000000000000000000000000";
  } catch (error) {
    throw new Error(`Failed to check if unified ID is registered: ${error.message}`);
  }
};

/**
 * Get master wallet address for a unified ID using mother contract
 * @param {string} unifiedId - Unified ID to get master wallet for
 * @param {string} contractAddress - Mother contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<string>} Master wallet address (zero address if not registered)
 */
const getMasterWalletforUnifiedID = async (unifiedId, contractAddress, rpcUrl) => {
  if (!unifiedId) {
    throw new Error("unifiedId is required in getMasterWalletforUnifiedID");
  }
  
  try {
    const motherContract = getMotherContract(contractAddress, rpcUrl);
    const masterAddress = await motherContract.getMasterAddress(unifiedId);
    return masterAddress;
  } catch (error) {
    throw new Error(`Failed to get master wallet for unified ID: ${error.message}`);
  }
};

/**
 * Get primary wallet address for a unified ID using child contract
 * @param {string} unifiedId - Unified ID to get primary wallet for
 * @param {string} contractAddress - Child contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<string>} Primary wallet address (zero address if not registered)
 */
const getPrimaryWalletforUnifiedID = async (unifiedId, contractAddress, rpcUrl) => {
  if (!unifiedId) {
    throw new Error("unifiedId is required in getPrimaryWalletforUnifiedID");
  }
  
  try {
    const childContract = getChildContract(contractAddress, rpcUrl);
    const primaryAddress = await childContract.getPrimaryAddress(unifiedId);
    return primaryAddress;
  } catch (error) {
    throw new Error(`Failed to get primary wallet for unified ID: ${error.message}`);
  }
};

/**
 * Get secondary wallet addresses for a unified ID using child contract
 * @param {string} unifiedId - Unified ID to get secondary wallets for
 * @param {string} contractAddress - Child contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<string[]>} Array of secondary wallet addresses (empty array if none found)
 */
const getSecondaryWalletsforUnifiedID = async (unifiedId, contractAddress, rpcUrl) => {
  if (!unifiedId) {
    throw new Error("unifiedId is required in getSecondaryWalletsforUnifiedID");
  }
  
  try {
    const childContract = getChildContract(contractAddress, rpcUrl);
    const secondaryAddresses = await childContract.getSecondaryAddresses(unifiedId);
    return secondaryAddresses;
  } catch (error) {
    throw new Error(`Failed to get secondary wallets for unified ID: ${error.message}`);
  }
};

/**
 * Resolve secondary address to unified ID using child contract
 * @param {string} secondaryAddr - Secondary address to resolve
 * @param {string} contractAddress - Child contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<string>} Unified ID for the secondary address
 */
const resolveSecondaryAddressToUnifiedId = async (secondaryAddr, contractAddress, rpcUrl) => {
  if (!secondaryAddr) {
    throw new Error("secondaryAddr is required in resolveSecondaryAddressToUnifiedId");
  }
  
  try {
    const childContract = getChildContract(contractAddress, rpcUrl);
    const unifiedId = await childContract.resolveSecondaryAddressToUnifiedId(secondaryAddr);
    return unifiedId;
  } catch (error) {
    throw new Error(`Failed to resolve secondary address to unified ID: ${error.message}`);
  }
};

/**
 * Get unified ID by primary address using mother contract
 * @param {string} primaryAddr - Primary address to resolve
 * @param {number} chainId - Chain ID
 * @param {string} contractAddress - Mother contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<string>} Unified ID for the primary address
 */
const getUnifiedIDByPrimaryAddress = async (primaryAddr, chainId, contractAddress, rpcUrl) => {
  if (!primaryAddr) {
    throw new Error("primaryAddr is required in getUnifiedIDByPrimaryAddress");
  }
  
  if (!chainId) {
    throw new Error("chainId is required in getUnifiedIDByPrimaryAddress");
  }
  
  try {
    const motherContract = getMotherContract(contractAddress, rpcUrl);
    const unifiedId = await motherContract.resolveAddressToUnifiedId(primaryAddr, chainId);
    return unifiedId;
  } catch (error) {
    throw new Error(`Failed to get unified ID by primary address: ${error.message}`);
  }
};

/**
 * Get registration fees for a specific token using storage util contract
 * @param {string} token - Token address (use zero address for ETH)
 * @param {string|number} registrarFees - Registrar fees in wei
 * @param {string} contractAddress - Storage util contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<string>} Required token amount for registration
 */
const getRegistrationFees = async (token, registrarFees, contractAddress, rpcUrl) => {
  if (!token) {
    throw new Error("token is required in getRegistrationFees");
  }
  
  if (!registrarFees) {
    throw new Error("registrarFees is required in getRegistrationFees");
  }
  
  try {
    const storageUtilContract = getStorageUtilContract(contractAddress, rpcUrl);
    const requiredAmount = await storageUtilContract.getRequiredTokenAmount(token, registrarFees);
    return requiredAmount.toString();
  } catch (error) {
    throw new Error(`Failed to get registration fees: ${error.message}`);
  }
};

/**
 * Validate signature using storage util contract
 * @param {string} data - Data that was signed (hex string)
 * @param {string} expectedSigner - Expected signer address
 * @param {string} signature - Signature to validate
 * @param {string} contractAddress - Storage util contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<boolean>} True if signature is valid
 */
const validateSignature = async (data, expectedSigner, signature, contractAddress, rpcUrl) => {
  if (!data) {
    throw new Error("data is required in validateSignature");
  }
  
  if (!expectedSigner) {
    throw new Error("expectedSigner is required in validateSignature");
  }
  
  if (!signature) {
    throw new Error("signature is required in validateSignature");
  }
  
  try {
    const storageUtilContract = getStorageUtilContract(contractAddress, rpcUrl);
    const isValid = await storageUtilContract.verifySignature(data, expectedSigner, signature);
    return isValid;
  } catch (error) {
    throw new Error(`Failed to validate signature: ${error.message}`);
  }
};

/**
 * Check if unified ID is valid using storage util contract
 * @param {string} unifiedId - Unified ID to validate
 * @param {string} contractAddress - Storage util contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<boolean>} True if unified ID is valid
 */
const isValidUnifiedID = async (unifiedId, contractAddress, rpcUrl) => {
  if (!unifiedId) {
    throw new Error("unifiedId is required in isValidUnifiedID");
  }
  
  try {
    const storageUtilContract = getStorageUtilContract(contractAddress, rpcUrl);
    const isValid = await storageUtilContract.isUnifiedIdValid(unifiedId);
    return isValid;
  } catch (error) {
    throw new Error(`Failed to validate unified ID: ${error.message}`);
  }
};


/**
 * Get child contract address for given environment and chain ID
 * @param {Object} config - SDK configuration
 * @returns {string} Child contract address
 */
const getChildContractAddress = (config) => {
  const chainIdNum = Number(config.chainId);
  return CHILD_CONTRACT_ADDRESS_MAP[config.environment][chainIdNum];
};

/**
 * Get mother contract address for given environment and chain ID
 * @param {Object} config - SDK configuration
 * @returns {string} Mother contract address
 */
const getMotherContractAddress = (config) => {
  const chainIdNum = Number(config.chainId);
  const { MOTHER_CONTRACT_ADDRESS_MAP } = require('./config');
  return MOTHER_CONTRACT_ADDRESS_MAP[config.environment][chainIdNum];
};

/**
 * Get storage util contract address for given environment and chain ID
 * @param {Object} config - SDK configuration
 * @returns {string} Storage util contract address
 */
const getStorageUtilContractAddress = (config) => {
  const chainIdNum = Number(config.chainId);
  return STORAGE_UTIL_CONTRACT_ADDRESS_MAP[config.environment][chainIdNum];
};

module.exports = {
  resolveAnyAddressToUnifiedId: resolveAnyAddressToUnifiedId,
  resolveSecondaryAddressToUnifiedId: resolveSecondaryAddressToUnifiedId,
  getUnifiedIDByPrimaryAddress: getUnifiedIDByPrimaryAddress,
  getRegistrationFees: getRegistrationFees,
  validateSignature: validateSignature,
  isPrimaryAddressAlreadyRegistered : isPrimaryAddressAlreadyRegistered,
  isSecondaryAddressAlreadyRegistered: isSecondaryAddressAlreadyRegistered,
  isUnifiedIDAlreadyRegistered: isUnifiedIDAlreadyRegistered,
  getMasterWalletforUnifiedID: getMasterWalletforUnifiedID,
  getPrimaryWalletforUnifiedID : getPrimaryWalletforUnifiedID,
  getSecondaryWalletsforUnifiedID: getSecondaryWalletsforUnifiedID,
  isValidUnifiedID: isValidUnifiedID,
  getChildContractAddress: getChildContractAddress,
  getMotherContractAddress: getMotherContractAddress,
  getStorageUtilContractAddress: getStorageUtilContractAddress,
  getProvider: getProvider,
  getMotherContract: getMotherContract,
  getChildContract: getChildContract,
  getStorageUtilContract: getStorageUtilContract
}; 