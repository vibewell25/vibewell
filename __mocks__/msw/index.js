// Mock MSW module
const http = {
  get: () => null,
  post: () => null,
  put: () => null,
  delete: () => null,
  patch: () => null,
};

const HttpResponse = {
  json: (data) => ({
    status: 200,
    body: JSON.stringify(data),
  }),
  text: (content) => ({
    status: 200,
    body: content,
  }),
  error: () => ({
    status: 500,
  }),
  networkError: () => ({
    status: 0,
  }),
};

module.exports = {
  http,
  HttpResponse,
}; 