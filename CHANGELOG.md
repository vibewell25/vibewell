# Changelog

## [Unreleased]

### Security
- Removed all Web3/cryptocurrency functionality from codebase
  - Deleted web3-wallet-connector.tsx and related tests
  - Deleted web3-payment-form.tsx and related tests
  - Removed crypto payment option from payment-method-selector.tsx
  - Removed crypto payment option from payment-settings-form.tsx
  - Renamed truncateAddress function to truncateHash for more general use

### Dependencies
- Updated @react-three/drei to 10.0.6
- Updated @react-three/fiber to 9.1.2
- Updated @stripe/react-stripe-js to 3.6.0
- Updated @stripe/stripe-js to 7.0.0
- Updated React and React DOM to 19.1.0
- Updated Next.js to 15.3.0
- Removed @walletconnect/web3-provider and related dependencies

### Added

### Changed

### Fixed

### Removed 