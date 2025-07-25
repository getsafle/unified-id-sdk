// Supported chain IDs for each environment
const CHAIN_ID_MAP = {
  mainnet: [
    // 1,         // Ethereum Mainnet
    // 137,       // Polygon Mainnet
    // 56,        // BSC Mainnet
  ],
  testnet: [
    11155111,  // Ethereum Sepolia
    // 5,         // Ethereum Goerli
    // 80001,     // Polygon Mumbai
    // 97,        // BSC Testnet
  ]
};

// Map of environment -> chainId -> contract address
const CONTRACT_ADDRESS_MAP = {
  mainnet: {
    // 1: '0x...',      // Ethereum Mainnet
    // 137: '0x...',    // Polygon Mainnet
  },
  testnet: {
    11155111: '0x21068b37d05575B4D7DFa5393c7b140f65dA0355', // Sepolia example
    // 5: '0x...',      // Goerli
    // 80001: '0x...',  // Polygon Mumbai
    // 97: '0x...',     // BSC Testnet

  }
};

module.exports = {
  CHAIN_ID_MAP,
  CONTRACT_ADDRESS_MAP,
}; 