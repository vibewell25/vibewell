import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Add TextEncoder and TextDecoder to global scope for Jest
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock global Request and Headers for use with Next.js
global.Request = class MockRequest {
  constructor(input, init) {
    Object.assign(this, init);
    this.url = input;
  }
} as any;

global.Headers = class MockHeaders {
  private headers: Record<string, string> = {};
  constructor(init?: Record<string, string>) {
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }

  get(name: string): string | null {
    return this.headers[name.toLowerCase()] || null;
  }

  set(name: string, value: string): void {
    this.headers[name.toLowerCase()] = value;
  }

  has(name: string): boolean {
    return name.toLowerCase() in this.headers;
  }

  append(name: string, value: string): void {
    if (this.has(name)) {
      this.set(name, `${this.get(name)}, ${value}`);
    } else {
      this.set(name, value);
    }
  }

  delete(name: string): void {
    delete this.headers[name.toLowerCase()];
  }
} as any;

// Mock URL
global.URL = class MockURL {
  pathname: string;
  searchParams: URLSearchParams;
  href: string;
  origin: string;
  search: string;
  host: string;
  hostname: string;
  port: string;
  protocol: string;
  
  constructor(url: string, base?: string) {
    this.href = url;
    this.pathname = '/' + url.split('/').slice(3).join('/');
    this.searchParams = new URLSearchParams('');
    this.origin = 'http://localhost:3000';
    this.search = '';
    this.host = 'localhost:3000';
    this.hostname = 'localhost';
    this.port = '3000';
    this.protocol = 'http:';
  }
} as any;

// Suppress React act() warnings
// This is helpful for third-party components like Radix UI that cause act() warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning: An update to') && 
    args[0]?.includes?.('inside a test was not wrapped in act(...)') ||
    args[0]?.includes?.('was not wrapped in act(...)')
  ) {
    return; // Suppress act() warnings
  }
  originalConsoleError(...args);
};

// Mock the ARViewer component
jest.mock('@/components/ar/ar-viewer', () => ({
  ARViewer: jest.fn().mockImplementation(({ modelUrl, type }) => null)
}));

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    isMetaMask: true,
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
  writable: true,
});

// Mock Web3Modal
jest.mock('web3modal', () => {
  return jest.fn().mockImplementation(() => {
    return {
      cachedProvider: '',
      connect: jest.fn().mockResolvedValue({
        on: jest.fn(),
        removeListener: jest.fn(),
        request: jest.fn().mockImplementation((request) => {
          if (request.method === 'eth_requestAccounts') {
            return Promise.resolve(['0x1234567890123456789012345678901234567890']);
          }
          if (request.method === 'eth_chainId') {
            return Promise.resolve('0x1');
          }
          if (request.method === 'wallet_switchEthereumChain') {
            return Promise.resolve();
          }
          return Promise.resolve();
        }),
        disconnect: jest.fn().mockResolvedValue(true),
      }),
      clearCachedProvider: jest.fn(),
      on: jest.fn(),
    };
  });
});

// Mock ethers.js
jest.mock('ethers', () => {
  return {
    ethers: {
      providers: {
        Web3Provider: jest.fn().mockImplementation(() => {
          return {
            getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'mainnet' }),
            listAccounts: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
            getSigner: jest.fn().mockReturnValue({
              getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
              sendTransaction: jest.fn().mockResolvedValue({
                hash: '0xabcdef1234567890',
                wait: jest.fn().mockResolvedValue({ status: 1 }),
              }),
            }),
          };
        }),
      },
      Contract: jest.fn().mockImplementation(() => {
        return {
          balanceOf: jest.fn().mockResolvedValue('1000000000000000000'),
          allowance: jest.fn().mockResolvedValue('1000000000000000000'),
          decimals: jest.fn().mockResolvedValue(18),
          approve: jest.fn().mockResolvedValue({
            hash: '0xabcdef1234567890',
            wait: jest.fn().mockResolvedValue({ status: 1 }),
          }),
          transfer: jest.fn().mockResolvedValue({
            hash: '0xabcdef1234567890',
            wait: jest.fn().mockResolvedValue({ status: 1 }),
          }),
        };
      }),
      utils: {
        parseUnits: jest.fn().mockImplementation((value, decimals = 18) => value + '0'.repeat(decimals)),
        formatUnits: jest.fn().mockImplementation((value, decimals = 18) => 
          (parseFloat(value.toString()) / Math.pow(10, decimals)).toString()
        ),
        formatEther: jest.fn().mockImplementation(value => 
          (parseFloat(value.toString()) / Math.pow(10, 18)).toString()
        ),
        parseEther: jest.fn().mockImplementation(value => value + '0'.repeat(18)),
      },
      BigNumber: {
        from: jest.fn().mockImplementation(value => ({ 
          toString: () => value.toString(),
          mul: jest.fn().mockReturnValue({ toString: () => (parseInt(value) * 2).toString() }),
          div: jest.fn().mockReturnValue({ toString: () => (parseInt(value) / 2).toString() }),
        })),
      },
    },
  };
});

// Mock web3modal/dist/providers/connectors
jest.mock('web3modal/dist/providers/connectors', () => ({
  coinbaseWallet: jest.fn().mockImplementation(() => ({
    id: 'coinbasewallet',
    name: 'Coinbase Wallet',
    logo: 'coinbase.svg',
    connector: jest.fn().mockResolvedValue({
      on: jest.fn(),
      removeListener: jest.fn(),
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    }),
  })),
}));

// Mock for global fetch
global.fetch = jest.fn((_input: RequestInfo | URL, _init?: RequestInit) => Promise.resolve({
  json: () => Promise.resolve({}),
  ok: true,
  status: 200,
  statusText: 'OK',
})) as jest.Mock;

// Set up localStorage mock
class LocalStorageMock {
  store: Record<string, string> = {};
  
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  
  removeItem(key: string): void {
    delete this.store[key];
  }
  
  clear(): void {
    this.store = {};
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
  }),
}));

// Mock web3modal connector
jest.mock('@web3modal/ethereum', () => ({
  useWeb3Modal: jest.fn().mockReturnValue({
    open: jest.fn().mockResolvedValue(true),
    close: jest.fn(),
  }),
}));

// Mock for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 