// Mock for next/server
class NextRequest {
  constructor(url, options = {}) {
    this.url = url || 'http://localhost:3000';
    this.method = options.method || 'GET';
    this.headers = new Headers(options.headers || {});
    this.nextUrl = new URL(this.url);
    this.ip = options.ip || '127.0.0.1';
    this.cookies = {
      get: jest.fn().mockReturnValue(null),
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn(),
      delete: jest.fn(),
    };
  }
  
  json() {
    return Promise.resolve({});
  }
  
  text() {
    return Promise.resolve('');
  }
}

class NextResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new Headers(options.headers || {});
  }
  
  static json(body, options = {}) {
    return new NextResponse(JSON.stringify(body), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  }
  
  static redirect(url, options = {}) {
    return new NextResponse('', {
      status: 302,
      headers: {
        Location: url,
      },
      ...options,
    });
  }
  
  static next(options = {}) {
    return new NextResponse('', options);
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

module.exports = {
  NextRequest,
  NextResponse,
}; 