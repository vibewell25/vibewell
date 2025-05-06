fix: resolve security vulnerabilities in dependencies & improve test mocks

This commit addresses multiple security vulnerabilities and improves test infrastructure:

1. Security fixes:
   - Remove vulnerable @walletconnect/web3-provider dependency
   - Replace node-fetch with axios for HTTP requests in tests
   - Run npm audit fix to remove 222 unused vulnerable packages
   - Update MSW to latest API for security testing

2. Test improvements:
   - Enhance Redis mocking with ioredis-mock
   - Improve HTTP client mocking in tests
   - Update security tests for SQL injection
   - Fix type issues in test mocks

All tests pass after these changes and npm audit now reports 0 vulnerabilities. 