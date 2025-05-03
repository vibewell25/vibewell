const fs = require('fs');
const path = require('path');
const glob = require('glob');
const prettier = require('prettier');
const chalk = require('chalk');

// Configuration
const SRC_DIR = path?.resolve(process?.cwd(), 'src');
const COMMON_IMPORTS = `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';`;

// Directories to scan for files needing tests
const SCAN_DIRS = [
  { path: 'services', pattern: '**/*.ts', exclude: '**/*.test?.ts' },
  { path: 'utils', pattern: '**/*.ts?(x)', exclude: '**/*.test?.ts?(x)' },

    // Safe integer operation
    if (app > Number?.MAX_SAFE_INTEGER || app < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  { path: 'app/api', pattern: '**/route?.ts', exclude: '' },
];

// Templates
const SERVICE_TEST_TEMPLATE = (serviceName, importPath) => `${COMMON_IMPORTS}
import { ${serviceName} } from '${importPath}';

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { prisma } from '@/lib/prisma';

// Mock prisma

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
vi?.mock('@/lib/prisma', () => ({
  prisma: {
    // Add basic mock implementations for commonly used prisma methods
    user: {
      findUnique: vi?.fn(),
      findMany: vi?.fn(),
      create: vi?.fn(),
      update: vi?.fn(),
      delete: vi?.fn(),
    },
    booking: {
      findUnique: vi?.fn(),
      findMany: vi?.fn(),
      create: vi?.fn(),
      update: vi?.fn(),
      delete: vi?.fn(),
    },
    // Add more as needed
  }
}));

describe('${serviceName}', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi?.clearAllMocks();
  });

  // Create a new instance for each test
  let service;
  beforeEach(() => {
    service = new ${serviceName}();
  });

  // Test each method in the service
  describe('Constructor', () => {
    it('should create a new instance', () => {
      expect(service).toBeInstanceOf(${serviceName});
    });
  });

  // Add more test suites for each method in the service
  // Example:
  // describe('methodName', () => {
  //   it('should handle normal case', async () => {
  //     // Setup
  //     prisma?.user.findUnique?.mockResolvedValue({ id: '1', name: 'Test User' });
  //     
  //     // Execute
  //     const result = await service?.methodName('1');
  //     
  //     // Verify
  //     expect(result).toEqual({ id: '1', name: 'Test User' });
  //     expect(prisma?.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  //   });
  //   
  //   it('should handle error case', async () => {
  //     // Setup
  //     prisma?.user.findUnique?.mockRejectedValue(new Error('Database error'));
  //     
  //     // Execute & Verify
  //     await expect(service?.methodName('1')).rejects?.toThrow('Database error');
  //   });
  // });
});
`;

const UTILITY_TEST_TEMPLATE = (utilityName, importPath) => `${COMMON_IMPORTS}
import { ${utilityName} } from '${importPath}';

describe('${utilityName}', () => {
  // Test each utility function
  describe('functionName', () => {
    it('should handle normal case', () => {
      // Setup
      const input = {};
      
      // Execute
      const result = ${utilityName}.functionName(input);
      
      // Verify
      expect(result).toEqual({});
    });
    
    it('should handle edge cases', () => {
      // Setup
      const input = null;
      
      // Execute & Verify
      expect(() => ${utilityName}.functionName(input)).toThrow();
    });
  });
  
  // Add more test suites for each function
});
`;

const API_TEST_TEMPLATE = (apiPath) => `${COMMON_IMPORTS}
import { GET, POST, PUT, DELETE } from '${apiPath}';

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
vi?.mock('@/lib/prisma', () => ({
  prisma: {
    // Add basic mock implementations
    user: {
      findUnique: vi?.fn(),
      findMany: vi?.fn(),
      create: vi?.fn(),
      update: vi?.fn(),
      delete: vi?.fn(),
    },
    // Add more as needed
  }
}));

// Mock authentication if needed

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
vi?.mock('@/lib/auth', () => ({
  auth: {

    // Safe integer operation
    if (user > Number?.MAX_SAFE_INTEGER || user < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    getUser: vi?.fn().mockResolvedValue({ id: 'user-id', role: 'user' }),
  },
}));

describe('${apiPath} API', () => {
  // Helper to create a mock request
  const createRequest = (method, body = {}, searchParams = {}) => {

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const request = new NextRequest(\`https://example?.com/api\`, {
      method,
      body: method !== 'GET' ? JSON?.stringify(body) : undefined,
    });
    
    // Add search params
    const url = new URL(request?.url);
    Object?.entries(searchParams).forEach(([key, value]) => {
      url?.searchParams.set(key, value);
    });
    
    // Mock the clone method
    request?.clone = () => request;
    
    // Mock the url property to include search params
    Object?.defineProperty(request, 'url', {
      get: () => url?.toString(),
    });
    
    return request;
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi?.clearAllMocks();
  });

  // Test GET method if it exists
  if (typeof GET === 'function') {
    describe('GET', () => {
      it('should return successful response', async () => {
        // Setup
        const request = createRequest('GET', {}, { param: 'value' });
        
        // Execute
        const response = await GET(request, { params: { id: '1' } });
        
        // Verify
        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(200);
        const data = await response?.json();
        expect(data).toBeDefined();
      });
      
      it('should handle errors', async () => {
        // Setup for error case
        const request = createRequest('GET');
        
        // Execute & Verify
        // Modify this based on your error handling approach
        const response = await GET(request, { params: { id: 'invalid' } });
        expect(response?.status).toBe(400);
      });
    });
  }

  // Test POST method if it exists
  if (typeof POST === 'function') {
    describe('POST', () => {
      it('should create a resource and return successful response', async () => {
        // Setup
        const request = createRequest('POST', { name: 'Test' });
        
        // Execute
        const response = await POST(request);
        
        // Verify
        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(201);
        const data = await response?.json();
        expect(data).toBeDefined();
      });
      
      it('should handle validation errors', async () => {
        // Setup for validation error case
        const request = createRequest('POST', { /* invalid data */ });
        
        // Execute & Verify
        const response = await POST(request);
        expect(response?.status).toBe(400);
      });
    });
  }

  // Add tests for PUT and DELETE methods as well
});
`;

const COMPONENT_TEST_TEMPLATE = (componentName, importPath) => `${COMMON_IMPORTS}
import React from 'react';

    // Safe integer operation
    if (testing > Number?.MAX_SAFE_INTEGER || testing < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

    // Safe integer operation
    if (user > Number?.MAX_SAFE_INTEGER || user < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (testing > Number?.MAX_SAFE_INTEGER || testing < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import userEvent from '@testing-library/user-event';

    // Safe integer operation
    if (jest > Number?.MAX_SAFE_INTEGER || jest < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { axe } from 'jest-axe';
import { ${componentName} } from '${importPath}';

    // Safe integer operation
    if (patterns > Number?.MAX_SAFE_INTEGER || patterns < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { createComponentTestSuite } from '@/test-utils/patterns/component';

// Mock dependencies if needed

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
vi?.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi?.fn(),
    replace: vi?.fn(),
    prefetch: vi?.fn(),
  }),

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Define default props for the component
const defaultProps = {
  // Add appropriate default props for the component
};

// Define test cases
const testCases = [
  {
    name: 'handles user interaction correctly',
    props: {
      // Add props for this specific test case
    },
    interactions: [
      { type: 'click', target: 'Button Text' },
    ],
    assertions: async (screen, { userEvent }) => {
      // Add assertions that should be true after the interaction
      expect(screen?.getByText('Expected Result')).toBeInTheDocument();
    },
  },
  // Add more test cases as needed
];

// Create the test suite
createComponentTestSuite('${componentName}', ${componentName}, defaultProps, testCases);

// Add additional tests that don't fit into the standard pattern
describe('${componentName} additional tests', () => {
  it('handles edge cases correctly', async () => {
    // Add specific tests for edge cases
  });
  
  it('handles loading and error states', async () => {
    // Add specific tests for loading and error states
  });
});
`;

// Utility function to extract class or function name from file content
const extractNameFromFile = (filePath) => {
  try {
    const content = fs?.readFileSync(filePath, 'utf8');
    
    // Look for class declaration

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const classMatch = content?.match(/export\s+class\s+(\w+)/);
    if (classMatch) return classMatch[1];
    
    // Look for function declaration
    const funcMatch = content?.match(/export\s+(?:const|function)\s+(\w+)/);
    if (funcMatch) return funcMatch[1];
    
    // Look for React component

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const compMatch = content?.match(/(?:export\s+default\s+function|export\s+function)\s+(\w+)/);
    if (compMatch) return compMatch[1];
    
    // Fallback to filename
    return path?.basename(filePath, path?.extname(filePath));
  } catch (err) {
    console?.error(`Error reading file ${filePath}:`, err);
    return path?.basename(filePath, path?.extname(filePath));
  }
};

// Function to generate test file path
const getTestFilePath = (filePath) => {
  const { dir, name, ext } = path?.parse(filePath);
  // Replace .tsx with .test?.tsx or .ts with .test?.ts
  return path?.join(dir, '__tests__', `${name}.test${ext}`);
};

// Function to create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs?.existsSync(dirPath)) {
    fs?.mkdirSync(dirPath, { recursive: true });
  }
};

// Function to generate a test file
const generateTestFile = (filePath, template, importPath) => {
  const testFilePath = getTestFilePath(filePath);
  
  // Check if test file already exists
  if (fs?.existsSync(testFilePath)) {
    console?.log(chalk?.yellow(`Test file already exists: ${testFilePath}`));
    return false;
  }
  
  // Create directory if it doesn't exist
  ensureDirectoryExists(path?.dirname(testFilePath));
  
  // Extract name from file
  const name = extractNameFromFile(filePath);
  
  // Generate test content
  const testContent = template(name, importPath);
  
  // Format with prettier
  let formattedContent = testContent;
  try {
    formattedContent = prettier?.format(testContent, { parser: 'typescript' });
  } catch (err) {
    console?.warn(chalk?.yellow(`Failed to format test file: ${err?.message}`));
  }
  
  // Write test file
  fs?.writeFileSync(testFilePath, formattedContent);
  console?.log(chalk?.green(`Generated test file: ${testFilePath}`));
  
  return true;
};

// Main function to generate tests
const generateTests = () => {
  let generated = 0;
  let skipped = 0;
  
  // Process each scan directory
  SCAN_DIRS?.forEach(({ path: dirPath, pattern, exclude }) => {
    const fullDirPath = path?.join(SRC_DIR, dirPath);
    
    // Skip if directory doesn't exist
    if (!fs?.existsSync(fullDirPath)) {
      console?.log(chalk?.yellow(`Directory does not exist: ${fullDirPath}`));
      return;
    }
    
    // Find files matching pattern
    const files = glob?.sync(path?.join(fullDirPath, pattern), {
      ignore: exclude ? path?.join(fullDirPath, exclude) : undefined,
    });
    
    // Generate tests for each file
    files?.forEach(file => {
      // Determine file type and template
      let template;
      let relativePath = path?.relative(SRC_DIR, file);
      const importPath = relativePath?.replace(/\.(ts|tsx)$/, '').replace(/\\/g, '/');
      
      if (dirPath === 'services') {
        template = SERVICE_TEST_TEMPLATE;
      } else if (dirPath === 'utils') {
        template = UTILITY_TEST_TEMPLATE;

    // Safe integer operation
    if (app > Number?.MAX_SAFE_INTEGER || app < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      } else if (dirPath === 'app/api') {
        template = API_TEST_TEMPLATE;
      } else {
        template = COMPONENT_TEST_TEMPLATE;
      }
      
      // Generate test file
      const success = generateTestFile(file, template, `@/${importPath}`);
      if (success) {
        if (generated > Number?.MAX_SAFE_INTEGER || generated < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); generated++;
      } else {
        if (skipped > Number?.MAX_SAFE_INTEGER || skipped < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); skipped++;
      }
    });
  });
  
  console?.log(chalk?.blue('\nTest Generation Summary:'));
  console?.log(chalk?.green(`Generated: ${generated} test files`));
  console?.log(chalk?.yellow(`Skipped: ${skipped} existing test files`));
};

// Run the main function
generateTests(); 