const { ethers } = require('ethers');
const axios = require('axios');

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
  const finalConfig = { ...config };
  
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
 * Create the message hash to be signed for various unified ID operations
 * @param {string} operation - Type of operation: 'register', 'primaryChange', 'removeSecondary', 'updateUnifiedId'
 * @param {Object} params - Parameters for the operation
 * @returns {string} Hash (message) to be signed
 */
const createSignatureMessage = (operation, params) => {
  let inner;
  let packed;
  // Parameter validation
  switch (operation) {
    case 'register': {
      if (!params.unifiedId || typeof params.unifiedId !== 'string') {
        throw new Error('Missing or invalid unifiedId for register operation');
      }
      if (!params.userAddress || !ethers.utils.isAddress(params.userAddress)) {
        throw new Error('Missing or invalid userAddress for register operation');
      }
      if (params.nonce === undefined || params.nonce === null || isNaN(params.nonce)) {
        throw new Error('Missing or invalid nonce for register operation');
      }
      inner = ethers.utils.defaultAbiCoder.encode(
        ['string', 'address'],
        [params.unifiedId, params.userAddress]
      );
      packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, params.nonce]);
      break;
    }
    case 'primaryChange': {
      if (!params.unifiedId || typeof params.unifiedId !== 'string') {
        throw new Error('Missing or invalid unifiedId for primaryChange operation');
      }
      if (!params.newAddress || !ethers.utils.isAddress(params.newAddress)) {
        throw new Error('Missing or invalid newAddress for primaryChange operation');
      }
      if (params.nonce === undefined || params.nonce === null || isNaN(params.nonce)) {
        throw new Error('Missing or invalid nonce for primaryChange operation');
      }
      inner = ethers.utils.defaultAbiCoder.encode(
        ['string', 'address'],
        [params.unifiedId, params.newAddress]
      );
      packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, params.nonce]);
      break;
    }
    case 'removeSecondary': {
      if (!params.unifiedId || typeof params.unifiedId !== 'string') {
        throw new Error('Missing or invalid unifiedId for removeSecondary operation');
      }
      if (!params.secondaryAddress || !ethers.utils.isAddress(params.secondaryAddress)) {
        throw new Error('Missing or invalid secondaryAddress for removeSecondary operation');
      }
      if (params.nonce === undefined || params.nonce === null || isNaN(params.nonce)) {
        throw new Error('Missing or invalid nonce for removeSecondary operation');
      }
      inner = ethers.utils.defaultAbiCoder.encode(
        ['string', 'address'],
        [params.unifiedId, params.secondaryAddress]
      );
      packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, params.nonce]);
      break;
    }
    case 'updateUnifiedId': {
      if (!params.oldUnifiedId || typeof params.oldUnifiedId !== 'string') {
        throw new Error('Missing or invalid oldUnifiedId for updateUnifiedId operation');
      }
      if (!params.newUnifiedId || typeof params.newUnifiedId !== 'string') {
        throw new Error('Missing or invalid newUnifiedId for updateUnifiedId operation');
      }
      if (params.nonce === undefined || params.nonce === null || isNaN(params.nonce)) {
        throw new Error('Missing or invalid nonce for updateUnifiedId operation');
      }
      inner = ethers.utils.defaultAbiCoder.encode(
        ['string', 'string'],
        [params.oldUnifiedId, params.newUnifiedId]
      );
      packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, params.nonce]);
      break;
    }
    default:
      throw new Error('Unknown operation type for signature message');
  }
  const hash = ethers.utils.keccak256(packed);
  return hash;
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
 * @param {string} params.userAddress - User's wallet address
 * @param {string|number} params.nonce - Nonce
 * @param {string} params.signature - User's signature (already signed)
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Registration result
 */
const registerUnifiedId = async ({ unifiedId, userAddress, nonce, signature, config = {} }) => {
  try {
    if (!signature) throw new Error('Missing required signature for registration');
    const finalConfig = { ...config };
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
 * @param {string} params.secondaryAddress - Secondary address to add
 * @param {string|number} params.nonce - Nonce
 * @param {string} params.primarySignature - Signature from primary wallet
 * @param {string} params.secondarySignature - Signature from secondary wallet
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Result
 */
const addSecondaryAddress = async ({ unifiedId, secondaryAddress, nonce, primarySignature, secondarySignature, config = {} }) => {
  try {
    if (!primarySignature || !secondarySignature) throw new Error('Missing required signatures for addSecondaryAddress');
    const finalConfig = { ...config };
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
 * @param {string} params.newAddress - New primary address
 * @param {string|number} params.nonce - Nonce
 * @param {string} params.currentPrimarySignature - Signature from current primary wallet
 * @param {string} params.newPrimarySignature - Signature from new primary wallet
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Result
 */
const changePrimaryAddress = async ({ unifiedId, newAddress, nonce, currentPrimarySignature, newPrimarySignature, config = {} }) => {
  try {
    if (!currentPrimarySignature || !newPrimarySignature) throw new Error('Missing required signatures for changePrimaryAddress');
    const finalConfig = { ...config };
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
      currentPrimarySignature: currentPrimarySignature,
      newPrimarySignature: newPrimarySignature,
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
 * @param {string|number} params.nonce - Nonce
 * @param {string} params.signature - Signature from primary wallet
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Result
 */
const removeSecondaryAddress = async ({ unifiedId, secondaryAddress, nonce, signature, config = {} }) => {
  try {
    if (!signature) throw new Error('Missing required signature for removeSecondaryAddress');
    const finalConfig = { ...config };
    // Create options with deadline
    const options = createOptions(nonce);
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
 * @param {string|number} params.nonce - Nonce
 * @param {string} params.signature - Signature from master wallet
 * @param {Object} params.config - SDK configuration
 * @returns {Promise<Object>} Result
 */
const updateUnifiedId = async ({ oldUnifiedId, newUnifiedId, nonce, signature, config = {} }) => {
  try {
    if (!signature) throw new Error('Missing required signature for updateUnifiedId');
    const finalConfig = { ...config };
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

// Supported chain IDs for each environment
const CHAIN_ID_MAP = {
  mainnet: [
   // 1,         // Ethereum Mainnet
    // Add more mainnet chain IDs as needed
  ],
  testnet: [
    11155111,  // Ethereum Sepolia
    // 5,         // Ethereum Goerli
    // 80001,     // Polygon Mumbai
    // 97,        // BSC Testnet
    // Add more testnet chain IDs as needed
  ]
};

function validateConfig(config) {
  if (!config) throw new Error('Config object is required');
  if (!config.baseURL || typeof config.baseURL !== 'string') throw new Error('Missing or invalid baseURL in config');
  if (!config.authToken || typeof config.authToken !== 'string') throw new Error('Missing or invalid authToken in config');
  if (!config.chainId || isNaN(config.chainId)) throw new Error('Missing or invalid chainId in config');
  if (!config.motherContractAddress || !ethers.utils.isAddress(config.motherContractAddress)) throw new Error('Missing or invalid motherContractAddress in config');
  if (!config.environment || (config.environment !== 'testnet' && config.environment !== 'mainnet')) {
    throw new Error("'environment' must be either 'testnet' or 'mainnet'");
  }
  const chainIdNum = Number(config.chainId);
  if (!CHAIN_ID_MAP[config.environment].includes(chainIdNum)) {
    throw new Error(`Chain ID ${chainIdNum} is not allowed for environment '${config.environment}'. Allowed: [${CHAIN_ID_MAP[config.environment].join(', ')}]`);
  }
}

class UnifiedIdSDK {
  constructor(config) {
    validateConfig(config);
    this.config = { ...config };
  }

  async registerUnifiedId({ unifiedId, userAddress, nonce, signature }) {
    return await registerUnifiedId({
      unifiedId,
      userAddress,
      nonce,
      signature,
      config: this.config
    });
  }

  async addSecondaryAddress({ unifiedId, secondaryAddress, nonce, primarySignature, secondarySignature }) {
    return await addSecondaryAddress({
      unifiedId,
      secondaryAddress,
      nonce,
      primarySignature,
      secondarySignature,
      config: this.config
    });
  }

  async removeSecondaryAddress({ unifiedId, secondaryAddress, nonce, signature }) {
    return await removeSecondaryAddress({
      unifiedId,
      secondaryAddress,
      nonce,
      signature,
      config: this.config
    });
  }

  async changePrimaryAddress({ unifiedId, newAddress, nonce, currentPrimarySignature, newPrimarySignature }) {
    return await changePrimaryAddress({
      unifiedId,
      newAddress,
      nonce,
      currentPrimarySignature,
      newPrimarySignature,
      config: this.config
    });
  }

  async updateUnifiedId({ oldUnifiedId, newUnifiedId, nonce, signature }) {
    return await updateUnifiedId({
      oldUnifiedId,
      newUnifiedId,
      nonce,
      signature,
      config: this.config
    });
  }

  // Optionally, expose utility methods as instance methods if needed
  static createSignatureMessage = createSignatureMessage;
  static getWallet = getWallet;
  static getProvider = getProvider;
  static getNonce = getNonce;
  static createOptions = createOptions;
}

// Export the class as the main export, and utility functions as named exports
module.exports = UnifiedIdSDK;
module.exports.createSignatureMessage = createSignatureMessage;
module.exports.getWallet = getWallet;
module.exports.getProvider = getProvider;
module.exports.getNonce = getNonce;
module.exports.createOptions = createOptions; 