# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial SDK release
- Comprehensive API coverage for all Unified ID operations
- Automatic EIP-712 signature generation
- Manual signature generation utilities
- Cross-chain support
- Comprehensive error handling and retry logic
- Full JSDoc documentation
- Type safety with parameter validation
- Production-ready configuration options
- Health check and ping endpoints
- Address management operations
- Batch operation support
- Custom signature type support
- Comprehensive test suite
- ESLint configuration
- Rollup bundling configuration
- Example applications

### Features
- **SDK Class**: Main `UnifiedIdSDK` class with all operations
- **Factory Function**: `createUnifiedIdSDK()` for easy instantiation
- **Automatic Signatures**: Built-in EIP-712 signature generation
- **Manual Signatures**: Support for external signature generation
- **Health Monitoring**: Service health and ping endpoints
- **Error Handling**: Comprehensive error handling with detailed messages
- **Retry Logic**: Built-in retry mechanisms for network operations
- **Configuration**: Flexible configuration options
- **Documentation**: Complete API documentation with examples

### API Methods
- `registerUnifiedId()` - Register with automatic signatures
- `updateUnifiedId()` - Update with automatic signature
- `setUnifiedId()` - Register with manual signatures
- `updateUnifiedIdManual()` - Update with manual signature
- `updatePrimaryAddress()` - Update primary address
- `addSecondaryAddress()` - Add secondary address
- `removeSecondaryAddress()` - Remove secondary address
- `generateRegistrationSignatures()` - Generate registration signatures
- `generateUpdateSignature()` - Generate update signature
- `getHealth()` - Check service health
- `ping()` - Ping service
- `getConfig()` - Get SDK configuration

### Configuration Options
- `baseURL` - API base URL (required)
- `authToken` - Authentication token (required)
- `chainId` - Default chain ID (optional)
- `motherContractAddress` - Contract address for signatures (optional)
- `timeout` - Request timeout in milliseconds (optional)
- `headers` - Custom headers (optional)

### Examples
- Basic usage example
- Advanced usage example
- Signature generation example
- Complete registration flow
- Batch operations
- Address management
- Error handling
- Retry logic

### Development
- Jest test configuration
- ESLint configuration
- Rollup bundling
- Babel configuration
- Comprehensive test suite
- Code coverage reporting
- Development scripts

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Unified ID Relayer SDK
- Complete API coverage for Unified ID operations
- EIP-712 signature generation and validation
- Cross-chain identity management
- Production-ready error handling
- Comprehensive documentation and examples

---

## Version History

- **1.0.0** - Initial release with full API coverage
- **Unreleased** - Development version with latest features

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 