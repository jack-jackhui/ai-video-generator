import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Test logger
describe('logger', () => {
  const originalEnv = process.env.NODE_ENV;
  
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  it('should have debug, info, warn, error methods', async () => {
    const { logger } = await import('@/lib/logger');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});

// Test tokenStorage
describe('tokenStorage', () => {
  beforeEach(() => {
    // Mock localStorage
    const store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should set and get token', async () => {
    const { tokenStorage } = await import('@/lib/auth/tokenStorage');
    tokenStorage.set('test-token-123');
    expect(tokenStorage.get()).toBe('test-token-123');
  });

  it('should remove token', async () => {
    const { tokenStorage } = await import('@/lib/auth/tokenStorage');
    tokenStorage.set('test-token-456');
    tokenStorage.remove();
    expect(tokenStorage.get()).toBeNull();
  });
});

// Test env utility
describe('env', () => {
  it('should export required functions', async () => {
    const env = await import('@/lib/env');
    expect(env).toBeDefined();
  });
});
