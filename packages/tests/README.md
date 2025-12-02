# Rodistaa Test Suite

Comprehensive test suite for the Rodistaa platform.

## Structure

```
tests/
├── unit/          # Jest unit tests
├── e2e/           # Playwright E2E tests
└── integration/   # Integration tests
```

## Running Tests

```bash
# Run all tests
pnpm test:all

# Run unit tests only
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm test:coverage
```

## Test Types

### Unit Tests
- Backend module tests
- ACS engine tests
- Utility function tests

### E2E Tests
- Portal workflows
- API integration tests
- User journey tests

### Integration Tests
- Database operations
- External service mocks
- Full flow tests

