# Unified ID Relayer SDK

[![npm version](https://badge.fury.io/js/%40unified-id%2Frelayer-sdk.svg)](https://badge.fury.io/js/%40unified-id%2Frelayer-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

Official JavaScript SDK for the Unified ID Relayer Queue API. This SDK provides a comprehensive interface for managing blockchain identities across multiple chains with automatic signature generation, error handling, and retry logic.

## 🚀 Features

- **Automatic Signature Generation**: EIP-712 compliant signatures for all operations
- **Cross-Chain Support**: Manage identities across multiple blockchain networks
- **Comprehensive Error Handling**: Built-in retry logic and detailed error messages
- **Type Safety**: Full JSDoc documentation with parameter validation
- **Flexible Configuration**: Support for both automatic and manual signature generation
- **Production Ready**: Battle-tested in production environments

## 📦 Installation

```bash
npm install @unified-id/relayer-sdk
```

## 🔧 Quick Start

### Basic Setup

```javascript
const { createUnifiedIdSDK } = require('@unified-id/relayer-sdk');

const sdk = createUnifiedIdSDK({
  baseURL: 'https://your-relayer-api.com',
  authToken: 'your-auth-token',
  chainId: 11155111, // Sepolia
  motherContractAddress: '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202'
});
```

### Register a Unified ID

```javascript
// Automatic signature generation
const result = await sdk.registerUnifiedId({
  unifiedId: 'my-unified-id',
  primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  masterPrivateKey: 'your-master-private-key',
  primaryPrivateKey: 'your-primary-private-key'
});

if (result.success) {
  console.log('Registration successful:', result.data);
} else {
  console.error('Registration failed:', result.error);
}
```

### Manual Signature Generation

```javascript
// Generate signatures manually
const signatures = await sdk.generateRegistrationSignatures({
  unifiedId: 'my-unified-id',
  primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  masterPrivateKey: 'your-master-private-key',
  primaryPrivateKey: 'your-primary-private-key'
});

// Use signatures in manual registration
const result = await sdk.setUnifiedId({
  userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  unifiedId: 'my-unified-id',
  masterSignature: signatures.masterSignature,
  primarySignature: signatures.primarySignature
});
```

## 📚 API Reference

### SDK Configuration

```javascript
const config = {
  baseURL: 'https://your-relayer-api.com',        // Required: API base URL
  authToken: 'your-auth-token',                   // Required: Authentication token
  chainId: 11155111,                             // Optional: Default chain ID (Sepolia)
  motherContractAddress: '0x...',                // Optional: Contract address for signatures
  timeout: 30000,                                // Optional: Request timeout in ms
  headers: {                                      // Optional: Custom headers
    'Content-Type': 'application/json'
  }
};
```

### Core Methods

#### `registerUnifiedId(params)`
Register a new Unified ID with automatic signature generation.

```javascript
const result = await sdk.registerUnifiedId({
  unifiedId: 'string',           // Required: Unique identifier
  primaryAddress: 'string',      // Required: Primary wallet address
  masterPrivateKey: 'string',    // Required: Master wallet private key
  primaryPrivateKey: 'string'    // Required: Primary wallet private key
});
```

#### `updateUnifiedId(params)`
Update an existing Unified ID with automatic signature generation.

```javascript
const result = await sdk.updateUnifiedId({
  previousUnifiedId: 'string',   // Required: Current Unified ID
  newUnifiedId: 'string',        // Required: New Unified ID
  masterPrivateKey: 'string'     // Required: Master wallet private key
});
```

#### `setUnifiedId(params)`
Register a Unified ID with manual signatures.

```javascript
const result = await sdk.setUnifiedId({
  userAddress: 'string',         // Required: User wallet address
  unifiedId: 'string',           // Required: Unique identifier
  masterSignature: 'string',     // Required: Master signature
  primarySignature: 'string',    // Required: Primary signature
  chainId: 11155111,            // Optional: Chain ID
  options: 'string'              // Optional: Additional options
});
```

#### `updateUnifiedIdManual(params)`
Update a Unified ID with manual signature.

```javascript
const result = await sdk.updateUnifiedIdManual({
  previousUnifiedId: 'string',   // Required: Current Unified ID
  newUnifiedId: 'string',        // Required: New Unified ID
  signature: 'string',           // Required: Master signature
  chainId: 11155111,            // Optional: Chain ID
  options: 'string'              // Optional: Additional options
});
```

#### `updatePrimaryAddress(params)`
Update the primary address for a Unified ID.

```javascript
const result = await sdk.updatePrimaryAddress({
  unifiedId: 'string',           // Required: Unified ID
  newPrimaryAddress: 'string',   // Required: New primary address
  currentPrimarySignature: 'string', // Required: Current primary signature
  newPrimarySignature: 'string',     // Required: New primary signature
  chainId: 11155111,            // Optional: Chain ID
  options: 'string'              // Optional: Additional options
});
```

#### `addSecondaryAddress(params)`
Add a secondary address to a Unified ID.

```javascript
const result = await sdk.addSecondaryAddress({
  unifiedId: 'string',           // Required: Unified ID
  secondaryAddress: 'string',    // Required: Secondary address
  primarySignature: 'string',    // Required: Primary signature
  secondarySignature: 'string',  // Required: Secondary signature
  chainId: 11155111,            // Optional: Chain ID
  options: 'string'              // Optional: Additional options
});
```

#### `removeSecondaryAddress(params)`
Remove a secondary address from a Unified ID.

```javascript
const result = await sdk.removeSecondaryAddress({
  unifiedId: 'string',           // Required: Unified ID
  secondaryAddress: 'string',    // Required: Secondary address
  signature: 'string',           // Required: Primary signature
  chainId: 11155111,            // Optional: Chain ID
  options: 'string'              // Optional: Additional options
});
```

### Utility Methods

#### `generateRegistrationSignatures(params)`
Generate EIP-712 signatures for registration.

```javascript
const signatures = await sdk.generateRegistrationSignatures({
  unifiedId: 'string',           // Required: Unified ID
  primaryAddress: 'string',      // Required: Primary address
  masterPrivateKey: 'string',    // Required: Master private key
  primaryPrivateKey: 'string'    // Required: Primary private key
});

// Returns: { masterSignature, primarySignature, nonce, deadline }
```

#### `generateUpdateSignature(params)`
Generate EIP-712 signature for update operations.

```javascript
const signature = await sdk.generateUpdateSignature({
  previousUnifiedId: 'string',   // Required: Current Unified ID
  newUnifiedId: 'string',        // Required: New Unified ID
  masterPrivateKey: 'string'     // Required: Master private key
});
```

#### `getHealth()`
Check service health status.

```javascript
const health = await sdk.getHealth();
```

#### `ping()`
Ping the service.

```javascript
const ping = await sdk.ping();
```

#### `getConfig()`
Get current SDK configuration.

```javascript
const config = sdk.getConfig();
```

## 🔐 Signature Generation

The SDK supports both automatic and manual signature generation using EIP-712 standard.

### Automatic Signatures

```javascript
// The SDK automatically generates signatures when private keys are provided
const result = await sdk.registerUnifiedId({
  unifiedId: 'my-id',
  primaryAddress: '0x...',
  masterPrivateKey: '0x...',
  primaryPrivateKey: '0x...'
});
```

### Manual Signatures

```javascript
// Generate signatures manually
const signatures = await sdk.generateRegistrationSignatures({
  unifiedId: 'my-id',
  primaryAddress: '0x...',
  masterPrivateKey: '0x...',
  primaryPrivateKey: '0x...'
});

// Use in manual registration
const result = await sdk.setUnifiedId({
  userAddress: '0x...',
  unifiedId: 'my-id',
  masterSignature: signatures.masterSignature,
  primarySignature: signatures.primarySignature
});
```

### Custom Signature Types

```javascript
const { ethers } = require('ethers');

// Create custom domain
const domain = {
  name: 'CustomUnifiedID',
  version: '2.0',
  chainId: 11155111,
  verifyingContract: '0x...'
};

// Create custom types
const types = {
  CustomOperation: [
    { name: 'unifiedId', type: 'string' },
    { name: 'operation', type: 'string' },
    { name: 'timestamp', type: 'uint256' }
  ]
};

// Generate custom signature
const wallet = new ethers.Wallet(privateKey);
const signature = await wallet.signTypedData(domain, types, message);
```

## 🛠️ Error Handling

The SDK provides comprehensive error handling with detailed error messages.

```javascript
try {
  const result = await sdk.registerUnifiedId(params);
  
  if (result.success) {
    console.log('Success:', result.data);
  } else {
    console.error('API Error:', result.error);
    console.error('Status:', result.status);
  }
} catch (error) {
  console.error('SDK Error:', error.message);
}
```

### Common Error Types

- **Configuration Errors**: Missing required configuration parameters
- **Signature Errors**: Invalid or missing signatures
- **Network Errors**: Connection issues or timeouts
- **API Errors**: Server-side errors with detailed messages

## 🔄 Retry Logic

The SDK includes built-in retry logic for network operations.

```javascript
// Custom retry implementation
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

// Usage
const result = await retryOperation(() => sdk.registerUnifiedId(params));
```

## 📋 Examples

### Complete Registration Flow

```javascript
const { createUnifiedIdSDK } = require('@unified-id/relayer-sdk');

async function registerUser() {
  const sdk = createUnifiedIdSDK({
    baseURL: 'https://api.unified-id.com',
    authToken: process.env.AUTH_TOKEN,
    chainId: 11155111,
    motherContractAddress: process.env.CONTRACT_ADDRESS
  });

  try {
    // Check service health
    const health = await sdk.getHealth();
    if (!health.success) {
      throw new Error('Service unavailable');
    }

    // Register Unified ID
    const result = await sdk.registerUnifiedId({
      unifiedId: 'user-' + Date.now(),
      primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      masterPrivateKey: process.env.MASTER_PRIVATE_KEY,
      primaryPrivateKey: process.env.PRIMARY_PRIVATE_KEY
    });

    if (result.success) {
      console.log('Registration successful:', result.data);
      return result.data;
    } else {
      throw new Error(`Registration failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    throw error;
  }
}
```

### Batch Operations

```javascript
async function batchRegistration(unifiedIds) {
  const results = [];
  
  for (const unifiedId of unifiedIds) {
    try {
      const result = await sdk.registerUnifiedId({
        unifiedId: unifiedId,
        primaryAddress: '0x...',
        masterPrivateKey: process.env.MASTER_PRIVATE_KEY,
        primaryPrivateKey: process.env.PRIMARY_PRIVATE_KEY
      });
      
      results.push({ unifiedId, success: result.success, data: result.data });
    } catch (error) {
      results.push({ unifiedId, success: false, error: error.message });
    }
  }
  
  return results;
}
```

### Address Management

```javascript
async function manageAddresses() {
  // Add secondary address
  await sdk.addSecondaryAddress({
    unifiedId: 'my-unified-id',
    secondaryAddress: '0x...',
    primarySignature: '0x...',
    secondarySignature: '0x...'
  });

  // Update primary address
  await sdk.updatePrimaryAddress({
    unifiedId: 'my-unified-id',
    newPrimaryAddress: '0x...',
    currentPrimarySignature: '0x...',
    newPrimarySignature: '0x...'
  });

  // Remove secondary address
  await sdk.removeSecondaryAddress({
    unifiedId: 'my-unified-id',
    secondaryAddress: '0x...',
    signature: '0x...'
  });
}
```

## 🔧 Development

### Building from Source

```bash
git clone https://github.com/unified-id/relayer-sdk.git
cd relayer-sdk
npm install
npm run build
```

### Running Tests

```bash
npm test
npm run test:watch
```

### Running Examples

```bash
# Set environment variables
export RELAYER_URL="https://your-api.com"
export AUTH_TOKEN="your-token"
export MASTER_PRIVATE_KEY="your-master-key"
export PRIMARY_PRIVATE_KEY="your-primary-key"

# Run examples
npm run example:basic
npm run example:advanced
npm run example:signature
```

### Environment Variables

```bash
# Required
RELAYER_URL=https://your-api.com
AUTH_TOKEN=your-auth-token

# Optional (for examples)
MASTER_PRIVATE_KEY=your-master-private-key
PRIMARY_PRIVATE_KEY=your-primary-private-key
SECONDARY_PRIVATE_KEY=your-secondary-private-key
MOTHER_CONTRACT_ADDRESS=0x...
CHAIN_ID=11155111
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- **Documentation**: [https://docs.unified-id.com](https://docs.unified-id.com)
- **Issues**: [GitHub Issues](https://github.com/unified-id/relayer-sdk/issues)
- **Discord**: [Unified ID Community](https://discord.gg/unified-id)

## 🔗 Related Projects

- [Unified ID Contracts](https://github.com/unified-id/contracts) - Smart contracts
- [Unified ID Relayer](https://github.com/unified-id/relayer) - Relayer service
- [Unified ID Subgraph](https://github.com/unified-id/subgraph) - GraphQL API

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete list of changes.

---

**Made with ❤️ by the Unified ID Team** 