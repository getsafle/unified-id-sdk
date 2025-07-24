# Unified ID SDK

A functional JavaScript SDK for Unified ID registration and management with blockchain wallet integration.

## Features

- 🔐 **Wallet Integration**: Support for private keys and MetaMask wallets
- 📝 **Unified ID Registration**: Register new unified IDs with cryptographic signatures
- 🔗 **Secondary Address Management**: Add secondary addresses to existing unified IDs
- 🌐 **HTTP API Integration**: Seamless integration with your backend API
- ⚡ **Functional Design**: Pure functions with no class-based architecture
- 🔒 **Security**: EIP-191 compliant signatures and secure nonce management

## Installation

```bash
npm install unified-id-sdk
```

## Quick Start

### Basic Usage with Private Key

```javascript
const { registerUnifiedId, addSecondaryAddress, changePrimaryAddress } = require('unified-id-sdk');

// Configuration
const config = {
  baseURL: 'https://api.unifiedid.com',
  authToken: 'your-bearer-token-here',
  chainId: '11155111', // Sepolia testnet
  motherContractAddress: '0x35e58899007352e79d371EAd3bCe61E124ed8b8f'
};

// Register a new unified ID
const result = await registerUnifiedId({
  unifiedId: 'my-unified-id',
  wallet: '0x123...', // Private key
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
  config: config
});

if (result.success) {
  console.log('Registration successful:', result.data);
} else {
  console.log('Registration failed:', result.error);
}

// Change primary address
const changeResult = await changePrimaryAddress({
  unifiedId: 'my-unified-id',
  currentWallet: '0x123...', // Current primary private key
  newWallet: '0x456...',     // New primary private key
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
  config: config
});
```

### MetaMask Integration

```javascript
const { registerUnifiedId, getWallet } = require('unified-id-sdk');

// Connect to MetaMask
const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});

// Get wallet instance
const wallet = getWallet(window.ethereum, rpcUrl);

// Register unified ID
const result = await registerUnifiedId({
  unifiedId: 'my-unified-id',
  wallet: wallet,
  rpcUrl: rpcUrl,
  config: config
});
```

## API Reference

### Core Functions

#### `registerUnifiedId(params)`

Register a new unified ID.

**Parameters:**
- `unifiedId` (string): The unified ID to register
- `wallet` (string|Object): Private key string or wallet object
- `rpcUrl` (string): RPC URL for the blockchain network
- `config` (Object): SDK configuration

**Returns:**
```javascript
{
  success: boolean,
  data?: Object,        // API response data
  payload?: Object,     // Request payload sent
  error?: string,       // Error message if failed
  details?: Object      // Additional error details
}
```

#### `addSecondaryAddress(params)`

Add a secondary address to an existing unified ID.

**Parameters:**
- `unifiedId` (string): The unified ID
- `primaryWallet` (string|Object): Primary wallet private key or object
- `secondaryWallet` (string|Object): Secondary wallet private key or object
- `rpcUrl` (string): RPC URL for the blockchain network
- `config` (Object): SDK configuration

**Returns:**
```javascript
{
  success: boolean,
  data?: Object,
  payload?: Object,
  error?: string,
  details?: Object
}
```

#### `removeSecondaryAddress(params)`

Remove a secondary address from an existing unified ID.

**Parameters:**
- `unifiedId` (string): The unified ID
- `secondaryAddress` (string): The secondary address to remove
- `primaryWallet` (string|Object): Primary wallet private key or object
- `rpcUrl` (string): RPC URL for the blockchain network
- `config` (Object): SDK configuration

**Returns:**
```javascript
{
  success: boolean,
  data?: Object,
  payload?: Object,
  error?: string,
  details?: Object
}
```

#### `changePrimaryAddress(params)`

Change the primary address for an existing unified ID.

**Parameters:**
- `unifiedId` (string): The unified ID
- `currentWallet` (string|Object): Current primary wallet private key or object
- `newWallet` (string|Object): New primary wallet private key or object
- `rpcUrl` (string): RPC URL for the blockchain network
- `config` (Object): SDK configuration

**Returns:**
```javascript
{
  success: boolean,
  data?: Object,
  payload?: Object,
  error?: string,
  details?: Object
}
```

#### `getUnifiedIdInfo(unifiedId, config)`

Get information about a unified ID.

**Parameters:**
- `unifiedId` (string): The unified ID to query
- `config` (Object): SDK configuration

**Returns:**
```javascript
{
  success: boolean,
  data?: Object,
  error?: string,
  details?: Object
}
```

### Utility Functions

#### `getWallet(walletInput, rpcUrl)`

Create a wallet instance from private key or wallet object.

#### `getProvider(rpcUrl)`

Create an ethers provider for the specified RPC URL.

#### `getNonce(unifiedId, motherContractAddress, rpcUrl)`

Get the current nonce for a unified ID from the Mother contract.

#### `createSignature(unifiedId, userAddress, nonce, wallet)`

Create a cryptographic signature for unified ID operations.

#### `createPrimaryChangeSignature(unifiedId, newAddress, nonce, wallet)`

Create a cryptographic signature for primary address change operations.

#### `createRemoveSecondarySignature(unifiedId, secondaryAddress, nonce, wallet)`

Create a cryptographic signature for removing secondary address operations.

#### `createOptions(nonce, deadlineOffset)`

Create options blob with nonce and deadline.

#### `verifyWalletConnection(wallet)`

Verify that a wallet is properly connected.

#### `createHttpClient(config)`

Create an HTTP client with the specified configuration.

### Configuration

The SDK accepts the following configuration options:

```javascript
const config = {
  baseURL: 'https://api.unifiedid.com',           // API base URL
  timeout: 30000,                                 // HTTP timeout in ms
  chainId: '11155111',                           // Blockchain chain ID
  motherContractAddress: '0x...',                // Mother contract address
  authToken: 'your-bearer-token'                 // Optional auth token
};
```

## HTTP Request Format

The SDK automatically formats HTTP requests according to your specification:

### Registration Request
```javascript
{
  "userAddress": "0xd6eD91e314eD980aF958ced1b71721ee8A8b5E03",
  "unifiedId": "kunal_test_1",
  "chainId": "11155111",
  "nonce": "0",
  "action": "initiate-register-unifiedid",
  "masterSignature": "0x1729b7c4b01d646cff524c5116a036aacd6298e798692206fbdb274003c05a555e8e9838ad3f387b5009f0b7c1a14658c8aeaf92131082e5562b421d937d220e1b",
  "primarySignature": "0x1729b7c4b01d646cff524c5116a036aacd6298e798692206fbdb274003c05a555e8e9838ad3f387b5009f0b7c1a14658c8aeaf92131082e5562b421d937d220e1b",
  "options": "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000687b9f3c"
}
```

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer your-token`

## Examples

### Complete Registration Flow

```javascript
const { registerUnifiedId, addSecondaryAddress, removeSecondaryAddress, changePrimaryAddress, getUnifiedIdInfo } = require('unified-id-sdk');

async function completeFlow() {
  const config = {
    baseURL: 'https://api.unifiedid.com',
    authToken: 'your-token',
    chainId: '11155111',
    motherContractAddress: '0x35e58899007352e79d371EAd3bCe61E124ed8b8f'
  };

  const rpcUrl = 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID';
  const primaryPk = '0x123...';
  const secondaryPk = '0x456...';

  // 1. Register unified ID
  const registration = await registerUnifiedId({
    unifiedId: 'my-unified-id',
    wallet: primaryPk,
    rpcUrl: rpcUrl,
    config: config
  });

  if (registration.success) {
    console.log('✅ Registration successful');
    
    // 2. Add secondary address
    const secondary = await addSecondaryAddress({
      unifiedId: 'my-unified-id',
      primaryWallet: primaryPk,
      secondaryWallet: secondaryPk,
      rpcUrl: rpcUrl,
      config: config
    });

          if (secondary.success) {
        console.log('✅ Secondary address added');
        
        // 3. Remove secondary address
        const removeResult = await removeSecondaryAddress({
          unifiedId: 'my-unified-id',
          secondaryAddress: '0x456...', // Address to remove
          primaryWallet: primaryPk,
          rpcUrl: rpcUrl,
          config: config
        });

        if (removeResult.success) {
          console.log('✅ Secondary address removed');
          
          // 4. Change primary address
          const changeResult = await changePrimaryAddress({
            unifiedId: 'my-unified-id',
            currentWallet: primaryPk,
            newWallet: secondaryPk,
            rpcUrl: rpcUrl,
            config: config
          });

          if (changeResult.success) {
            console.log('✅ Primary address changed');
            
            // 5. Get unified ID info
            const info = await getUnifiedIdInfo('my-unified-id', config);
            if (info.success) {
              console.log('✅ Unified ID info:', info.data);
            }
          }
        }
      }
  }
}

### MetaMask Integration

```javascript
// In a web browser environment
async function connectAndRegister() {
  // Connect to MetaMask
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  
  const wallet = getWallet(window.ethereum, rpcUrl);
  
  // Register unified ID
  const result = await registerUnifiedId({
    unifiedId: 'my-unified-id',
    wallet: wallet,
    rpcUrl: rpcUrl,
    config: config
  });
  
  return result;
}
```

## Error Handling

The SDK returns structured error responses:

```javascript
const result = await registerUnifiedId(params);

if (!result.success) {
  console.error('Error:', result.error);
  console.error('Details:', result.details);
  
  // Handle specific error types
  if (result.error.includes('nonce')) {
    // Handle nonce-related errors
  } else if (result.error.includes('signature')) {
    // Handle signature-related errors
  }
}
```

## Security Considerations

1. **Private Keys**: Never expose private keys in client-side code
2. **Network Security**: Use HTTPS for all API communications
3. **Token Management**: Store authentication tokens securely
4. **Nonce Management**: The SDK automatically handles nonce retrieval and management
5. **Signature Verification**: All signatures follow EIP-191 standards

## Development

### Building the Package

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team. 