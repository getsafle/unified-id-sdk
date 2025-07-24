const { ethers } = require('ethers');
require('dotenv').config();
const axios = require('axios');

// Core configuration
const DEFAULT_CONFIG = {
  baseURL: process.env.API_URL,        
  authToken: process.env.AUTH_TOKEN,
  chainId: process.env.CHAIN_ID, 
  motherContractAddress: process.env.MOTHER_CONTRACT_ADDRESS
};

// Mother contract ABI for nonce retrieval
const MOTHER_CONTRACT_ABI = [
  "function nonces(string) view returns (uint256)",
  "function getNonce(string) view returns (uint256)"
];

/**
 * Create HTTP client with configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Axios instance
 */
const createHttpClient = (config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return axios.create({
    baseURL: finalConfig.baseURL,
    timeout: finalConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': finalConfig.authToken ? `Bearer ${finalConfig.authToken}` : undefined
    }
  });
};

/**
 * Get provider for the specified network
 * @param {string} rpcUrl - RPC URL for the network
 * @returns {Object} Ethers provider
 */
const getProvider = (rpcUrl) => {
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

/**
 * Get wallet from private key or connect to MetaMask
 * @param {string|Object} walletInput - Private key string or wallet object
 * @param {string} rpcUrl - RPC URL for the network
 * @returns {Object} Ethers wallet
 */
const getWallet = (walletInput, rpcUrl) => {
  const provider = getProvider(rpcUrl);
  
  if (typeof walletInput === 'string') {
    // Private key provided
    return new ethers.Wallet(walletInput, provider);
  } else if (walletInput && walletInput.signMessage) {
    // Wallet object provided (e.g., MetaMask)
    return walletInput.connect(provider);
  } else {
    throw new Error('Invalid wallet input. Provide private key string or wallet object.');
  }
};

/**
 * Get current nonce from Mother contract
 * @param {string} unifiedId - Unified ID
 * @param {string} motherContractAddress - Mother contract address
 * @param {string} rpcUrl - RPC URL
 * @returns {Promise<string>} Current nonce
 */
const getNonce = async (unifiedId, motherContractAddress, rpcUrl) => {
  const provider = getProvider(rpcUrl);
  const mother = new ethers.Contract(motherContractAddress, MOTHER_CONTRACT_ABI, provider);
  
  try {
    // Try both function names for compatibility
    const nonce = await mother.nonces(unifiedId);
    return nonce.toString();
  } catch (error) {
    try {
      const nonce = await mother.getNonce(unifiedId);
      return nonce.toString();
    } catch (fallbackError) {
      throw new Error(`Failed to get nonce: ${fallbackError.message}`);
    }
  }
};

/**
 * Create signature for unified ID registration
 * @param {string} unifiedId - Unified ID
 * @param {string} userAddress - User's wallet address
 * @param {string} nonce - Current nonce
 * @param {Object} wallet - Ethers wallet instance
 * @returns {Promise<string>} Signature
 */
const createSignature = async (unifiedId, userAddress, nonce, wallet) => {
  // Build packed data exactly like Solidity
  const inner = ethers.utils.defaultAbiCoder.encode(
    ['string', 'address'],
    [unifiedId, userAddress] 
  );
  
  const packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, nonce]);
  const hash = ethers.utils.keccak256(packed);
  
  // Sign the hash (EIP-191 style)
  const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
  return signature;
};

/**
 * Create signature for primary address change
 * @param {string} unifiedId - Unified ID
 * @param {string} newAddress - New primary address
 * @param {string} nonce - Current nonce
 * @param {Object} wallet - Ethers wallet instance
 * @returns {Promise<string>} Signature
 */
const createPrimaryChangeSignature = async (unifiedId, newAddress, nonce, wallet) => {
  // Build packed data exactly like Solidity: keccak256( abi.encodePacked( abi.encode(id, newAddr), nonce ) )
  const inner = ethers.utils.defaultAbiCoder.encode(
    ['string', 'address'],
    [unifiedId, newAddress]
  );
  
  const packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, nonce]);
  const hash = ethers.utils.keccak256(packed);
  
  // Sign the hash (EIP-191 style)
  const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
  return signature;
};

/**
 * Create signature for removing secondary address
 * @param {string} unifiedId - Unified ID
 * @param {string} secondaryAddress - Secondary address to remove
 * @param {string} nonce - Current nonce
 * @param {Object} wallet - Ethers wallet instance
 * @returns {Promise<string>} Signature
 */
const createRemoveSecondarySignature = async (unifiedId, secondaryAddress, nonce, wallet) => {
  // Build packed data exactly like Solidity: abi.encodePacked( abi.encode(id, secAddr), nonce )
  const inner = ethers.utils.defaultAbiCoder.encode(
    ['string', 'address'],
    [unifiedId, secondaryAddress]
  );
  
  const packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, nonce]);
  const hash = ethers.utils.keccak256(packed);
  
  // Sign the hash (EIP-191 style)
  const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
  return signature;
};

/**
 * Create signature for updating unified ID
 * @param {string} oldUnifiedId - Old unified ID
 * @param {string} newUnifiedId - New unified ID
 * @param {string} nonce - Current nonce
 * @param {Object} wallet - Ethers wallet instance
 * @returns {Promise<string>} Signature
 */
const createUpdateUnifiedIdSignature = async (oldUnifiedId, newUnifiedId, nonce, wallet) => {
  // Build packed data exactly like Solidity: abi.encodePacked( abi.encode(oldId, newId), nonce )
  const inner = ethers.utils.defaultAbiCoder.encode(
    ['string', 'string'],
    [oldUnifiedId, newUnifiedId]
  );
  
  const packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, nonce]);
  const hash = ethers.utils.keccak256(packed);
  
  // Sign the hash (EIP-191 style)
  const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
  return signature;
};

/**
 * Create options blob with nonce and deadline
 * @param {string} nonce - Current nonce
 * @param {number} deadlineOffset - Deadline offset in seconds (default: 1 hour)
 * @returns {string} Options blob
 */
const createOptions = (nonce, deadlineOffset = 3600) => {
  const deadline = Math.floor(Date.now() / 1000) + deadlineOffset;
  
  return ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'uint256'],
    [nonce, deadline]
  );
};

/**
 * Register a new unified ID
 * @param {Object} params - Registration parameters
 * @param {string} params.unifiedId - Unified ID to register
 * @param {string|Object} params.wallet - Private key or wallet object
 * @param {string} params.rpcUrl - RPC URL
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Registration result
 */
const registerUnifiedId = async ({ unifiedId, wallet, rpcUrl, config = {} }) => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const walletInstance = getWallet(wallet, rpcUrl);
    const userAddress = walletInstance.address;
    
    // Get current nonce
    const nonce = await getNonce(unifiedId, finalConfig.motherContractAddress, rpcUrl);
    
    // Create signature
    const signature = await createSignature(unifiedId, userAddress, nonce, walletInstance);
    
    // Create options
    const options = createOptions(nonce);
    
    // Prepare request payload
    const payload = {
      chainId: finalConfig.chainId,
      unifiedId: unifiedId,
      userAddress: userAddress,
      nonce: nonce.toString(),
      action: 'initiate-register-unifiedid',
      masterSignature: signature,
      primarySignature: signature,
      options: options
    };
    
    // Send HTTP request
    const httpClient = createHttpClient(finalConfig);
    const response = await httpClient.post('/set-unifiedid', payload);
    
    return {
      success: true,
      data: response.data,
      payload: payload
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

/**
 * Add secondary address to existing unified ID
 * @param {Object} params - Secondary address parameters
 * @param {string} params.unifiedId - Unified ID
 * @param {string|Object} params.primaryWallet - Primary wallet private key or object
 * @param {string|Object} params.secondaryWallet - Secondary wallet private key or object
 * @param {string} params.rpcUrl - RPC URL
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Result
 */
const addSecondaryAddress = async ({ unifiedId, primaryWallet, secondaryWallet, rpcUrl, config = {} }) => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const primaryWalletInstance = getWallet(primaryWallet, rpcUrl);
    const secondaryWalletInstance = getWallet(secondaryWallet, rpcUrl);
    
    const primaryAddress = primaryWalletInstance.address;
    const secondaryAddress = secondaryWalletInstance.address;
    
    // Get current nonce
    const nonce = await getNonce(unifiedId, finalConfig.motherContractAddress, rpcUrl);
    
    // Create signatures
    const primarySignature = await createSignature(unifiedId, secondaryAddress, nonce, primaryWalletInstance);
    const secondarySignature = await createSignature(unifiedId, secondaryAddress, nonce, secondaryWalletInstance);
    
    // Create options
    const options = createOptions(nonce);
    
    // Prepare request payload
    const payload = {
      action: 'initiate-add-secondary-address',
      unifiedId: unifiedId,
      secondaryAddress: secondaryAddress,
      nonce: nonce.toString(),
      primarySignature: primarySignature,
      secondarySignature: secondarySignature,
      chainId: finalConfig.chainId,
      options: options
    };
    
    // Send HTTP request
    const httpClient = createHttpClient(finalConfig);
    const response = await httpClient.post('/add-secondary-address', payload);
    
    return {
      success: true,
      data: response.data,
      payload: payload
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

/**
 * Verify wallet connection (useful for MetaMask)
 * @param {Object} wallet - Wallet object
 * @returns {Promise<Object>} Verification result
 */
const verifyWalletConnection = async (wallet) => {
  try {
    const address = await wallet.getAddress();
    return {
      success: true,
      address: address,
      isConnected: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      isConnected: false
    };
  }
};

/**
 * Change primary address for existing unified ID
 * @param {Object} params - Primary address change parameters
 * @param {string} params.unifiedId - Unified ID
 * @param {string|Object} params.currentWallet - Current primary wallet private key or object
 * @param {string|Object} params.newWallet - New primary wallet private key or object
 * @param {string} params.rpcUrl - RPC URL
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Result
 */
const changePrimaryAddress = async ({ unifiedId, currentWallet, newWallet, rpcUrl, config = {} }) => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const currentWalletInstance = getWallet(currentWallet, rpcUrl);
    const newWalletInstance = getWallet(newWallet, rpcUrl);
    
    const currentAddress = currentWalletInstance.address;
    const newAddress = newWalletInstance.address;
    
    // Sanity checks
    if (currentAddress.toLowerCase() === newAddress.toLowerCase()) {
      throw new Error('Current and new addresses cannot be the same');
    }
    
    // Get current nonce
    const nonce = await getNonce(unifiedId, finalConfig.motherContractAddress, rpcUrl);
    
    // Create signatures for primary address change
    const currentSignature = await createPrimaryChangeSignature(unifiedId, newAddress, nonce, currentWalletInstance);
    const newSignature = await createPrimaryChangeSignature(unifiedId, newAddress, nonce, newWalletInstance);
    
    // Create options with deadline
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour deadline
    const options = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [nonce, deadline]
    );
    
    // Prepare request payload
    const payload = {
      chainId: finalConfig.chainId,
      unifiedId: unifiedId,
      newPrimaryAddress: newAddress,
      nonce: nonce.toString(),
      deadline: deadline,
      currentPrimarySignature: currentSignature,
      newPrimarySignature: newSignature,
      options: options
    };
    
    // Send HTTP request
    const httpClient = createHttpClient(finalConfig);
    const response = await httpClient.post('/update-primary-address', payload);
    
    return {
      success: true,
      data: response.data,
      payload: payload
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

/**
 * Remove secondary address from existing unified ID
 * @param {Object} params - Remove secondary address parameters
 * @param {string} params.unifiedId - Unified ID
 * @param {string} params.secondaryAddress - Secondary address to remove
 * @param {string|Object} params.primaryWallet - Primary wallet private key or object
 * @param {string} params.rpcUrl - RPC URL
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Result
 */
const removeSecondaryAddress = async ({ unifiedId, secondaryAddress, primaryWallet, rpcUrl, config = {} }) => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const primaryWalletInstance = getWallet(primaryWallet, rpcUrl);
    
    // Get current nonce
    const nonce = await getNonce(unifiedId, finalConfig.motherContractAddress, rpcUrl);
    
    // Create signature for removing secondary address
    const signature = await createRemoveSecondarySignature(unifiedId, secondaryAddress, nonce, primaryWalletInstance);
    
    // Create options with deadline
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour deadline
    const options = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [nonce, deadline]
    );
    
    // Prepare request payload
    const payload = {
      action: 'initiate-remove-secondary-address',
      chainId: finalConfig.chainId,
      unifiedId: unifiedId,
      secondaryAddress: secondaryAddress,
      nonce: nonce.toString(),
      signature: signature,
      options: options
    };
    
    // Send HTTP request
    const httpClient = createHttpClient(finalConfig);
    const response = await httpClient.post('/remove-secondary-address', payload);
    
    return {
      success: true,
      data: response.data,
      payload: payload
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

/**
 * Update unified ID (change from old ID to new ID)
 * @param {Object} params - Update unified ID parameters
 * @param {string} params.oldUnifiedId - Old unified ID
 * @param {string} params.newUnifiedId - New unified ID
 * @param {string|Object} params.wallet - Master wallet private key or object
 * @param {string} params.rpcUrl - RPC URL
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Result
 */
const updateUnifiedId = async ({ oldUnifiedId, newUnifiedId, wallet, rpcUrl, config = {} }) => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const walletInstance = getWallet(wallet, rpcUrl);
    
    // Sanity checks
    if (oldUnifiedId === newUnifiedId) {
      throw new Error('Old and new unified IDs cannot be the same');
    }
    
    // Get current nonce from the old unified ID
    const nonce = await getNonce(oldUnifiedId, finalConfig.motherContractAddress, rpcUrl);
    
    // Create signature for updating unified ID
    const signature = await createUpdateUnifiedIdSignature(oldUnifiedId, newUnifiedId, nonce, walletInstance);
    
    // Create options with deadline
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour deadline
    const options = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [nonce, deadline]
    );
    
    // Prepare request payload
    const payload = {
      action: 'initiate-update-unifiedid',
      previousUnifiedId: oldUnifiedId,
      newUnifiedId: newUnifiedId,
      nonce: nonce.toString(),
      deadline: deadline,
      signature: signature,
      options: options
    };
    
    // Send HTTP request
    const httpClient = createHttpClient(finalConfig);
    const response = await httpClient.post('/update-unifiedid', payload);
    
    return {
      success: true,
      data: response.data,
      payload: payload
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};


// Export all functions
module.exports = {
  // Core functions
  registerUnifiedId,
  addSecondaryAddress,
  removeSecondaryAddress,
  changePrimaryAddress,
  updateUnifiedId,
  
  // Utility functions
  getWallet,
  getProvider,
  getNonce,
  createSignature,
  createPrimaryChangeSignature,
  createRemoveSecondarySignature,
  createUpdateUnifiedIdSignature,
  createOptions,
  verifyWalletConnection,
  createHttpClient,
  
  // Constants
  DEFAULT_CONFIG
}; 