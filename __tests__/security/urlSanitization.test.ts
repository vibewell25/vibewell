import { sanitizeUrl } from '../../src/utils/security';

describe('URL Sanitization Edge Cases', () => {
  const testCases = [
    {
      input: 'javascript:alert("xss")',
      expected: 'about:blank',
      description: 'JavaScript protocol should be blocked'
    },
    {
      input: 'data:text/html,<script>alert("xss")</script>',
      expected: 'about:blank',
      description: 'Data URLs should be blocked'
    },
    {
      input: 'https://example.com?param=<script>alert("xss")</script>',
      expected: 'https://example.com?param=%3Cscript%3Ealert(%22xss%22)%3C/script%3E',
      description: 'Query parameters should be encoded'
    },
    {
      input: 'https://example.com#<script>alert("xss")</script>',
      expected: 'https://example.com#%3Cscript%3Ealert(%22xss%22)%3C/script%3E',
      description: 'Hash fragments should be encoded'
    },
    {
      input: 'https://example.com/path/<script>alert("xss")</script>',
      expected: 'https://example.com/path/%3Cscript%3Ealert(%22xss%22)%3C/script%3E',
      description: 'Path segments should be encoded'
    },
    {
      input: 'https://example.com?param1=value1&param2=<script>alert("xss")</script>',
      expected: 'https://example.com?param1=value1&param2=%3Cscript%3Ealert(%22xss%22)%3C/script%3E',
      description: 'Multiple query parameters should be encoded'
    },
    {
      input: 'https://example.com?param=value#<script>alert("xss")</script>',
      expected: 'https://example.com?param=value#%3Cscript%3Ealert(%22xss%22)%3C/script%3E',
      description: 'Both query parameters and hash fragments should be encoded'
    },
    {
      input: 'https://example.com?param=value&param2=<script>alert("xss")</script>#fragment',
      expected: 'https://example.com?param=value&param2=%3Cscript%3Ealert(%22xss%22)%3C/script%3E#fragment',
      description: 'Complex URL with multiple components should be properly encoded'
    },
    {
      input: 'https://example.com?param=value&param2=<script>alert("xss")</script>#<script>alert("xss")</script>',
      expected: 'https://example.com?param=value&param2=%3Cscript%3Ealert(%22xss%22)%3C/script%3E#%3Cscript%3Ealert(%22xss%22)%3C/script%3E',
      description: 'Multiple XSS attempts in different URL parts should be encoded'
    },
    {
      input: 'https://example.com?param=value&param2=<script>alert("xss")</script>#<script>alert("xss")</script>&param3=<script>alert("xss")</script>',
      expected: 'https://example.com?param=value&param2=%3Cscript%3Ealert(%22xss%22)%3C/script%3E#%3Cscript%3Ealert(%22xss%22)%3C/script%3E&param3=%3Cscript%3Ealert(%22xss%22)%3C/script%3E',
      description: 'Multiple XSS attempts in all URL parts should be encoded'
    }
  ];

  testCases.forEach(({ input, expected, description }) => {
    test(description, () => {
      expect(sanitizeUrl(input)).toBe(expected);
    });
  });

  test('should handle null or undefined input', () => {
    expect(sanitizeUrl(null)).toBe('about:blank');
    expect(sanitizeUrl(undefined)).toBe('about:blank');
  });

  test('should handle empty string input', () => {
    expect(sanitizeUrl('')).toBe('about:blank');
  });

  test('should handle non-string input', () => {
    expect(sanitizeUrl(123 as any)).toBe('about:blank');
    expect(sanitizeUrl({} as any)).toBe('about:blank');
    expect(sanitizeUrl([] as any)).toBe('about:blank');
  });
}); 