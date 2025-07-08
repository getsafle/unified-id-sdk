# UnifiedID SDK

A functional programming Node.js SDK for the UnifiedID system - Multi-chain identity resolution and management.

## Features

- 🚀 **Functional Programming Approach** - Pure functions and immutable data structures
- 🔗 **Multi-Chain Support** - Ethereum, Polygon, Arbitrum, Base, Optimism, BSC, Avalanche, and Sepolia
- ✍️ **Automatic Signature Creation** - EIP-712 signature generation for all operations
- 🔍 **Identity Resolution** - Resolve UnifiedIDs to addresses and vice versa
- 📊 **Real-time Monitoring** - Event-driven architecture with comprehensive logging
- 🛡️ **Type Safety** - Comprehensive validation and error handling
- ⚡ **High Performance** - Optimized for production use with retry mechanisms

## Installation

```bash
npm install @unifiedid/sdk
```

## Quick Start

```javascript
const { UnifiedID } = require('@unifiedid/sdk');
const { ethers } = require('ethers');

// Initialize SDK
const unifiedId = new UnifiedID({
  apiUrl: 'http://localhost:3000',
  rpcUrls: {
    11155111: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID', // Sepolia
    1: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID' // Ethereum
  },
  contractAddresses: {
    mother: {
      11155111: '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202', // Sepolia
      1: '0x...' // Ethereum
    }
  }
});

// Set up signer (e.g., MetaMask)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
unifiedId.setSigner(signer);

// Register a UnifiedID
const result = await unifiedId.registerUnifiedId({
  unifiedId: 'alice.eth',
  primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  chainId: 11155111
});

console.log('Registration result:', result);
```

## Configuration

### Basic Configuration

```javascript
const config = {
  // API endpoint
  apiUrl: 'http://localhost:3000',
  
  // RPC URLs for each chain
  rpcUrls: {
    1: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    11155111: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    137: 'https://polygon-rpc.com',
    42161: 'https://arb1.arbitrum.io/rpc'
  },
  
  // Contract addresses
  contractAddresses: {
    mother: {
      1: '0x...',
      11155111: '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202'
    },
    child: {
      1: '0x...',
      11155111: '0x...'
    },
    resolver: {
      1: '0x...',
      11155111: '0x...'
    }
  },
  
  // Timeouts
  timeouts: {
    transaction: 300000, // 5 minutes
    confirmation: 300000, // 5 minutes
    api: 30000 // 30 seconds
  },
  
  // Retry configuration
  retries: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    maxBackoff: 30000
  },
  
  // Logging
  logging: {
    level: 'info',
    enabled: true
  }
};
```

## API Reference

### Core Operations

#### Register UnifiedID

```javascript
// Automatic signature creation
const result = await unifiedId.registerUnifiedId({
  unifiedId: 'alice.eth',
  primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  chainId: 11155111
});

// Manual signature creation
const result = await unifiedId.registerUnifiedId({
  unifiedId: 'alice.eth',
  primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  chainId: 11155111,
  masterSignatureData: {
    signature: '0x...',
    deadline: 1234567890,
    nonce: 123
  },
  primarySignatureData: {
    signature: '0x...',
    deadline: 1234567890,
    nonce: 124
  }
});
```

#### Update UnifiedID

```javascript
const result = await unifiedId.updateUnifiedId({
  oldUnifiedId: 'alice.eth',
  newUnifiedId: 'alice_new.eth',
  chainId: 11155111
});
```

#### Update Primary Address

```javascript
const result = await unifiedId.updatePrimaryAddress({
  unifiedId: 'alice.eth',
  newPrimaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  chainId: 11155111
});
```

#### Add Secondary Address

```javascript
const result = await unifiedId.addSecondaryAddress({
  unifiedId: 'alice.eth',
  secondaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  chainId: 11155111
});
```

#### Remove Secondary Address

```javascript
const result = await unifiedId.removeSecondaryAddress({
  unifiedId: 'alice.eth',
  secondaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  chainId: 11155111
});
```

### Resolution Operations

#### Resolve UnifiedID to Primary Address

```javascript
const primaryAddress = await unifiedId.resolvers.resolvePrimaryAddress('alice.eth', 11155111);
console.log('Primary address:', primaryAddress);
```

#### Resolve Address to UnifiedID

```javascript
const unifiedId = await unifiedId.resolvers.resolveUnifiedId('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 11155111);
console.log('UnifiedID:', unifiedId);
```

#### Get Complete UnifiedID Information

```javascript
const info = await unifiedId.resolvers.getUnifiedIdInfo('alice.eth', 11155111);
console.log('UnifiedID info:', info);
// {
//   unifiedId: 'alice.eth',
//   masterAddress: '0x...',
//   primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
//   secondaryAddresses: ['0x...', '0x...'],
//   chainId: 11155111,
//   blockNumber: 123456,
//   transactionHash: '0x...',
//   timestamp: 1234567890
// }
```

#### Get Multi-Chain Information

```javascript
const multiChainInfo = await unifiedId.resolvers.getMultiChainUnifiedIdInfo('alice.eth');
console.log('Multi-chain info:', multiChainInfo);
// {
//   unifiedId: 'alice.eth',
//   masterAddress: '0x...',
//   chains: {
//     1: {
//       primaryAddress: '0x...',
//       secondaryAddresses: ['0x...'],
//       blockNumber: 123456,
//       transactionHash: '0x...',
//       timestamp: 1234567890
//     },
//     11155111: {
//       primaryAddress: '0x...',
//       secondaryAddresses: ['0x...'],
//       blockNumber: 123456,
//       transactionHash: '0x...',
//       timestamp: 1234567890
//     }
//   }
// }
```

#### Check Address Association

```javascript
const association = await unifiedId.resolvers.checkAddressAssociation(
  'alice.eth',
  '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  11155111
);
console.log('Association:', association);
// {
//   unifiedId: 'alice.eth',
//   isPrimary: true,
//   isSecondary: false,
//   chainId: 11155111
// }
```

#### Get All Addresses

```javascript
const addresses = await unifiedId.resolvers.getAllAddresses('alice.eth', 11155111);
console.log('All addresses:', addresses);
// {
//   primary: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
//   secondary: ['0x...', '0x...'],
//   all: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '0x...', '0x...']
// }
```

### Batch Operations

#### Batch Resolve UnifiedIDs

```javascript
const results = await unifiedId.resolvers.batchResolveUnifiedIds(
  ['alice.eth', 'bob.eth', 'charlie.eth'],
  11155111
);
console.log('Batch results:', results);
```

#### Batch Resolve Addresses

```javascript
const results = await unifiedId.resolvers.batchResolveAddresses(
  ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '0x...', '0x...'],
  11155111
);
console.log('Batch results:', results);
```

#### Batch Operations

```javascript
const operations = [
  {
    type: 'register',
    params: {
      unifiedId: 'alice.eth',
      primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      chainId: 11155111
    }
  },
  {
    type: 'add-secondary',
    params: {
      unifiedId: 'alice.eth',
      secondaryAddress: '0x...',
      chainId: 11155111
    }
  }
];

const results = await unifiedId.operations.batchOperations(operations);
console.log('Batch operation results:', results);
```

### Signature Utilities

#### Create Domain

```javascript
const domain = unifiedId.createDomain(
  '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202',
  11155111,
  'UnifiedID',
  '1'
);
```

#### Batch Create Signatures

```javascript
const operations = [
  {
    type: 'RegisterUnifiedId',
    unifiedId: 'alice.eth',
    primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    nonce: 123
  }
];

const signatures = await unifiedId.batchCreateSignatures(
  operations,
  11155111,
  unifiedId.createDeadline(30)
);
```

### System Monitoring

#### Health Check

```javascript
const health = await unifiedId.healthCheck();
console.log('System health:', health);
// {
//   status: 'healthy',
//   timestamp: 1234567890,
//   data: { ... }
// }
```

#### Get Statistics

```javascript
const stats = await unifiedId.getStats();
console.log('System stats:', stats);
```

#### Get Queue Status

```javascript
const queueStatus = await unifiedId.getQueueStatus();
console.log('Queue status:', queueStatus);
```

### Event Handling

```javascript
// Listen for operation events
unifiedId.on('operation:started', (event) => {
  console.log('Operation started:', event);
});

unifiedId.on('operation:completed', (event) => {
  console.log('Operation completed:', event);
});

unifiedId.on('operation:failed', (event) => {
  console.log('Operation failed:', event);
});

// Remove event listener
unifiedId.off('operation:started', listener);
```

### Validation

```javascript
// Validate UnifiedID format
const isValid = unifiedId.isValidUnifiedId('alice.eth'); // true
const isInvalid = unifiedId.isValidUnifiedId('invalid@id'); // false

// Validate Ethereum address
const isValidAddr = unifiedId.isValidAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'); // true
const isInvalidAddr = unifiedId.isValidAddress('invalid-address'); // false

// Validate configuration
const validation = unifiedId.validateConfig();
if (!validation.isValid) {
  console.log('Configuration errors:', validation.errors);
}
```

## Advanced Usage

### Custom Error Handling

```javascript
try {
  const result = await unifiedId.registerUnifiedId({
    unifiedId: 'alice.eth',
    primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    chainId: 11155111
  });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.log('Validation failed:', error.details.errors);
  } else if (error.code === 'API_ERROR') {
    console.log('API error:', error.details);
  } else if (error.code === 'NETWORK_ERROR') {
    console.log('Network error:', error.details);
  } else {
    console.log('Unknown error:', error);
  }
}
```

### Custom Logging

```javascript
const unifiedId = new UnifiedID({
  // ... other config
  logging: {
    level: 'debug',
    enabled: true
  }
});

// Custom logger
unifiedId.logger.info('Custom log message');
unifiedId.logger.error('Error message', { error: 'details' });
```

### Provider Management

```javascript
// Get provider for specific chain
const provider = unifiedId.getProvider(11155111);

// Check if chain is supported
const isSupported = unifiedId.isChainSupported(11155111); // true
```

## Supported Chains

- **Ethereum Mainnet** (1)
- **Sepolia Testnet** (11155111)
- **Polygon** (137)
- **Arbitrum** (42161)
- **Base** (8453)
- **Optimism** (10)
- **BSC** (56)
- **Avalanche** (43114)

## Error Codes

- `VALIDATION_ERROR` - Invalid parameters or data format
- `API_ERROR` - API request failed
- `NETWORK_ERROR` - Network connectivity issues
- `TRANSACTION_ERROR` - Blockchain transaction failed
- `INSUFFICIENT_FUNDS` - Insufficient funds for transaction
- `NONCE_EXPIRED` - Transaction nonce has expired
- `REPLACEMENT_UNDERPRICED` - Replacement transaction underpriced
- `UNKNOWN_ERROR` - Unknown error occurred

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

## Changelog

### v1.0.0
- Initial release
- Multi-chain support
- EIP-712 signature creation
- Identity resolution
- Event-driven architecture
- Comprehensive error handling 