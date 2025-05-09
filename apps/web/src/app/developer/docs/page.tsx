import { useState, Suspense } from 'react';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronRightIcon,
  ClockIcon,
  ServerIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  FingerPrintIcon,
  UserIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  CubeTransparentIcon,
  DocumentDuplicateIcon,
  CheckIcon,
from '@heroicons/react/24/outline';
import { Search } from 'lucide-react';

// JSON examples for the documentation
const examples = {
  auth: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
`,
  userProfile: `{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "profileImage": "https://storage.vibewell.com/avatars/user_123.jpg",
  "role": "customer",
  "preferences": {
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
"privacy": {
      "profileVisibility": "public",
      "emailVisibility": "private"
"createdAt": "2023-01-15T12:00:00Z",
  "updatedAt": "2023-02-20T15:30:00Z"
`,
  booking: `{
  "id": "booking_123",
  "providerId": "provider_456",
  "providerName": "Style Studio",
  "serviceId": "service_789",
  "serviceName": "Haircut & Style",
  "date": "2023-04-15",
  "startTime": "14:00:00",
  "endTime": "15:00:00",
  "status": "confirmed",
  "price": 75.00,
  "currency": "USD",
  "notes": "Please arrive 10 minutes early",
  "createdAt": "2023-03-20T10:15:00Z"
`,
// API endpoints for documentation
const endpoints = [
  {
    id: 'authentication',
    name: 'Authentication',
    icon: <FingerPrintIcon className="h-5 w-5" />,
    endpoints: [
      {
        method: 'POST',
        path: '/auth/login',
        description: 'Authenticate a user and get JWT tokens',
        requestBody: `{
  "email": "user@example.com",
  "password": "yourpassword"
`,
        responseExample: examples.auth,
{
        method: 'POST',
        path: '/auth/register',
        description: 'Register a new user account',
        requestBody: `{
  "email": "user@example.com",
  "password": "yourpassword",
  "name": "John Doe"
`,
{
        method: 'POST',
        path: '/auth/refresh',
        description: 'Refresh an expired JWT token',
        requestBody: `{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
`,
{
        method: 'POST',
        path: '/auth/password/reset',
        description: 'Request a password reset',
        requestBody: `{
  "email": "user@example.com"
`,
],
{
    id: 'users',
    name: 'Users',
    icon: <UserIcon className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/users/me',
        description: "Get the current user's profile",
        responseExample: examples.userProfile,
{
        method: 'PATCH',
        path: '/users/me',
        description: "Update the current user's profile",
        requestBody: `{
  "name": "John Smith",
  "phone": "+1987654321",
  "preferences": {
    "notifications": {
      "sms": true
`,
{
        method: 'POST',
        path: '/users/me/profile-image',
        description: 'Upload a profile image',
        notes: "Uses multipart/form-data with 'image' field",
],
{
    id: 'bookings',
    name: 'Bookings',
    icon: <CalendarIcon className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/bookings',
        description: 'Get all bookings for the current user',
        queryParams: [
          {
            name: 'status',
            description: 'Filter by status (pending, confirmed, completed, cancelled)',
{ name: 'from', description: 'Start date (YYYY-MM-DD)' },
          { name: 'to', description: 'End date (YYYY-MM-DD)' },
          { name: 'limit', description: 'Maximum number of results (default: 20)' },
          { name: 'offset', description: 'Results offset for pagination (default: 0)' },
        ],
{
        method: 'POST',
        path: '/bookings',
        description: 'Create a new booking',
        requestBody: `{
  "providerId": "provider_456",
  "serviceId": "service_789",
  "date": "2023-05-10",
  "startTime": "11:00:00",
  "notes": "First-time client"
`,
        responseExample: examples.booking,
{
        method: 'POST',
        path: '/bookings/{bookingId}/cancel',
        description: 'Cancel an existing booking',
        requestBody: `{
  "reason": "Schedule conflict"
`,
],
{
    id: 'providers',
    name: 'Providers',
    icon: <BuildingStorefrontIcon className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/providers/{providerId}',
        description: 'Get detailed information about a service provider',
{
        method: 'GET',
        path: '/providers/search',
        description: 'Search for providers based on various criteria',
        queryParams: [
          { name: 'query', description: 'Search term' },
          { name: 'category', description: 'Service category' },
          { name: 'location', description: 'Location name' },
          { name: 'lat & lng', description: 'Coordinates for location-based search' },
          { name: 'radius', description: 'Search radius in km (default: 10)' },
          { name: 'minRating', description: 'Minimum rating' },
        ],
],
{
    id: 'ar',
    name: 'AR Models',
    icon: <CubeTransparentIcon className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/ar/models',
        description: 'Get available AR models for virtual try-on',
        queryParams: [
          { name: 'category', description: 'Filter by category (makeup, hairstyle, accessory)' },
          { name: 'limit', description: 'Maximum number of results (default: 20)' },
          { name: 'offset', description: 'Results offset for pagination (default: 0)' },
        ],
{
        method: 'GET',
        path: '/ar/models/{modelId}',
        description: 'Get detailed information about a specific AR model',
],
{
    id: 'content',
    name: 'Content',
    icon: <DocumentTextIcon className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/content/articles',
        description: 'Get wellness content articles',
        queryParams: [
          {
            name: 'category',
            description: 'Filter by category (meditation, yoga, nutrition, etc.)',
{ name: 'tags', description: 'Filter by tags (comma-separated list)' },
        ],
{
        method: 'GET',
        path: '/content/articles/{articleId}',
        description: 'Get the full content of a specific article',
],
{
    id: 'reviews',
    name: 'Reviews',
    icon: <DocumentDuplicateIcon className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/providers/{providerId}/reviews',
        description: 'Get reviews for a specific service provider',
        queryParams: [
          { name: 'rating', description: 'Filter by rating (1-5)' },
          { name: 'sort', description: 'Sort order (newest, oldest, highest, lowest)' },
        ],
{
        method: 'POST',
        path: '/bookings/{bookingId}/review',
        description: 'Create a new review for a completed service',
        requestBody: `{
  "rating": 5,
  "title": "Excellent service!",
  "content": "I had a wonderful experience. Very professional and friendly staff.",
  "images": [
    {
      "data": "base64EncodedImageData..."
]
`,
],
];

function ApiDocumentationContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  // Filter endpoints based on search query
  const filteredEndpoints =
    searchQuery.length > 0
      ? endpoints
          .map((category) => ({
            ...category,
            endpoints: category.endpoints.filter(
              (endpoint) =>
                endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
))
          .filter((category) => category.endpoints.length > 0)
      : endpoints;

  return (
    <Layout>
      <div className="container-app py-8">
        <div className="mb-2 flex items-center">
          <Link
            href="/developer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Developer Portal
          </Link>
          <ChevronRightIcon className="mx-2 h-4 w-4 text-muted-foreground" />
          <span>API Documentation</span>
        </div>

        <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
          <h1 className="text-3xl font-bold">API Documentation</h1>

          <div className="mt-4 flex gap-3 md:mt-0">
            <Button variant="outline" asChild>
              <Link href="/developer/docs/getting-started">Getting Started Guide</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/developer/sdk">SDKs & Libraries</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-20">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  className="w-full rounded-md border py-2 pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="mb-2 font-medium">Base URLs</div>
                <div className="mb-4 rounded-md bg-muted p-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Production:</span>
                    <br />
                    <code className="font-mono">https://api.vibewell.com/v1</code>
                  </div>
                  <div className="mt-2">
                    <span className="text-muted-foreground">Development:</span>
                    <br />
                    <code className="font-mono">http://localhost:3000/api</code>
                  </div>
                </div>

                <div className="mb-2 font-medium">API Endpoints</div>
                <nav className="mb-4 space-y-1">
                  {filteredEndpoints.map((category) => (
                    <div key={category.id} className="mb-2">
                      <div className="mb-1 flex items-center text-sm font-medium">
                        {category.icon}
                        <span className="ml-2">{category.name}</span>
                      </div>

                      <ul className="space-y-1 pl-7">
                        {category.endpoints.map((endpoint, index) => (
                          <li key={`${category.id}-${index}`}>
                            <button
                              className={`hover:text-primary flex w-full items-center py-1 text-left text-sm ${
                                selectedEndpoint === `${category.id}-${index}`
                                  ? 'text-primary font-medium'
                                  : 'text-muted-foreground'
`}
                              onClick={() => setSelectedEndpoint(`${category.id}-${index}`)}
                            >
                              <span
                                className={`inline-block w-12 font-mono ${
                                  endpoint.method === 'GET'
                                    ? 'text-green-600'
                                    : endpoint.method === 'POST'
                                      ? 'text-blue-600'
                                      : endpoint.method === 'PATCH'
                                        ? 'text-yellow-600'
                                        : endpoint.method === 'DELETE'
                                          ? 'text-red-600'
                                          : ''
`}
                              >
                                {endpoint.method}
                              </span>
                              <span className="truncate">{endpoint.path}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>

                <div className="mb-2 font-medium">Resources</div>
                <nav className="space-y-1">
                  <Link
                    href="/developer/docs/authentication"
                    className="flex items-center py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ShieldCheckIcon className="mr-2 h-4 w-4" />
                    Authentication
                  </Link>
                  <Link
                    href="/developer/docs/rate-limits"
                    className="flex items-center py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ClockIcon className="mr-2 h-4 w-4" />
                    Rate Limiting
                  </Link>
                  <Link
                    href="/developer/docs/webhooks"
                    className="flex items-center py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ServerIcon className="mr-2 h-4 w-4" />
                    Webhooks
                  </Link>
                  <Link
                    href="/developer/docs/errors"
                    className="flex items-center py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <CodeBracketIcon className="mr-2 h-4 w-4" />
                    Error Handling
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">
            <div className="mb-8 rounded-md border bg-card p-6">
              <h2 className="mb-4 text-2xl font-bold">Overview</h2>
              <p className="mb-4">
                This documentation provides detailed information about the Vibewell RESTful API
                endpoints, authentication requirements, request/response formats, and usage
                examples.
              </p>

              <h3 className="mb-3 mt-6 text-lg font-semibold">Authentication</h3>
              <p className="mb-4">
                Most API endpoints require authentication using JWT tokens. Include the token in the
                Authorization header:
              </p>
              <pre className="mb-4 rounded-md bg-muted p-3 font-mono text-sm">
                Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </pre>

              <h3 className="mb-3 mt-6 text-lg font-semibold">Rate Limiting</h3>
              <p className="mb-4">
                To ensure fair usage and protect our systems, all API endpoints are subject to rate
                limiting. Rate limit information is returned in the following HTTP headers:
              </p>
              <pre className="mb-4 rounded-md bg-muted p-3 font-mono text-sm">
                X-RateLimit-Limit: 100 X-RateLimit-Remaining: 99 X-RateLimit-Reset: 1628537268
              </pre>

              <h3 className="mb-3 mt-6 text-lg font-semibold">Error Handling</h3>
              <p className="mb-4">All API errors follow this format:</p>
              <pre className="mb-4 rounded-md bg-muted p-3 font-mono text-sm">
                {`{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional information
`}
              </pre>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-md border p-4">
                  <h4 className="mb-2 flex items-center font-semibold">
                    <ShieldCheckIcon className="text-primary mr-2 h-5 w-5" />
                    Authentication Required
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Most endpoints require a valid JWT token in the Authorization header.
                  </p>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="mb-2 flex items-center font-semibold">
                    <ServerIcon className="text-primary mr-2 h-5 w-5" />
                    RESTful Interface
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Standard HTTP methods and status codes are used throughout the API.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold">UI Components</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  Vibewell provides a collection of reusable UI components to help you build
                  consistent interfaces.
                </p>
                <Button asChild variant="outline">
                  <Link href="/developer/docs/components">
                    <CodeBracketIcon className="mr-2 h-4 w-4" />
                    Browse UI Components
                  </Link>
                </Button>
              </div>
            </div>

            {/* Endpoint list and details */}
            <div className="space-y-8">
              {filteredEndpoints.map((category) => (
                <div key={category.id} className="mb-8">
                  <h2 className="mb-4 flex items-center text-xl font-bold">
                    {category.icon}
                    <span className="ml-2">{category.name} API</span>
                  </h2>

                  {category.endpoints.map((endpoint, index) => (
                    <div
                      key={`${category.id}-${index}`}
                      id={`${category.id}-${index}`}
                      className={`mb-4 rounded-md border ${
                        selectedEndpoint === `${category.id}-${index}`
                          ? 'border-primary ring-primary ring-1'
                          : ''
`}
                    >
                      <div className="p-4">
                        <div className="mb-2 flex items-center">
                          <span
                            className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${
                              endpoint.method === 'GET'
                                ? 'bg-green-100 text-green-800'
                                : endpoint.method === 'POST'
                                  ? 'bg-blue-100 text-blue-800'
                                  : endpoint.method === 'PATCH'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : endpoint.method === 'DELETE'
                                      ? 'bg-red-100 text-red-800'
                                      : ''
`}
                          >
                            {endpoint.method}
                          </span>
                          <span className="ml-2 font-mono">{endpoint.path}</span>
                        </div>

                        <p className="text-muted-foreground">{endpoint.description}</p>
                      </div>

                      <div className="border-t">
                        <Tabs defaultValue="details">
                          <TabsList className="w-full rounded-none border-b px-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            {endpoint.requestBody && (
                              <TabsTrigger value="request">Request</TabsTrigger>
                            )}
                            {endpoint.responseExample && (
                              <TabsTrigger value="response">Response</TabsTrigger>
                            )}
                          </TabsList>

                          <TabsContent value="details" className="p-4">
                            {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                              <div className="mb-4">
                                <h4 className="mb-2 font-medium">Query Parameters</h4>
                                <ul className="space-y-2">
                                  {endpoint.queryParams.map((param, i) => (
                                    <li key={i} className="flex">
                                      <span className="min-w-[100px] font-mono text-sm">
                                        {param.name}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {param.description}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {endpoint.notes && (
                              <div className="rounded-md bg-muted p-3 text-sm">
                                <strong>Note:</strong> {endpoint.notes}
                              </div>
                            )}

                            <div className="mt-4">
                              <h4 className="mb-2 font-medium">Try it</h4>
                              <Button variant="outline">
                                <CodeBracketIcon className="mr-2 h-4 w-4" />
                                Open in API Explorer
                              </Button>
                            </div>
                          </TabsContent>

                          {endpoint.requestBody && (
                            <TabsContent value="request" className="p-4">
                              <h4 className="mb-2 font-medium">Request Body</h4>
                              <div className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm">
                                <pre>{endpoint.requestBody}</pre>
                              </div>

                              <div className="mt-4 flex">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <DocumentTextIcon className="mr-1 h-3 w-3" />
                                  Copy
                                </Button>
                              </div>
                            </TabsContent>
                          )}

                          {endpoint.responseExample && (
                            <TabsContent value="response" className="p-4">
                              <h4 className="mb-2 font-medium">Response Example</h4>
                              <div className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm">
                                <pre>{endpoint.responseExample}</pre>
                              </div>

                              <div className="mt-4 flex">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <DocumentTextIcon className="mr-1 h-3 w-3" />
                                  Copy
                                </Button>
                              </div>
                            </TabsContent>
                          )}
                        </Tabs>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Additional sections */}
            <div className="mb-8 rounded-md border bg-card p-6">
              <h2 className="mb-4 text-2xl font-bold">Webhooks</h2>
              <p className="mb-4">
                Vibewell provides webhook notifications for key events. To receive webhooks:
              </p>
              <ol className="mb-4 ml-5 list-decimal space-y-2">
                <li>Register a webhook URL in the developer dashboard</li>
                <li>Select which events you want to receive</li>
                <li>Implement an endpoint to receive the webhook POST requests</li>
              </ol>

              <h3 className="mb-2 mt-4 text-lg font-semibold">Example webhook payload:</h3>
              <pre className="mb-4 rounded-md bg-muted p-3 font-mono text-sm">
                {`{
  "event": "booking.created",
  "timestamp": "2023-03-25T14:20:00Z",
  "data": {
    "bookingId": "booking_123",
    "providerId": "provider_456",
    "userId": "user_789",
    "serviceId": "service_101",
    "date": "2023-05-10",
    "status": "pending"
`}
              </pre>

              <h3 className="mb-2 mt-4 text-lg font-semibold">Available webhook events:</h3>
              <ul className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <code className="font-mono text-sm">booking.created</code>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <code className="font-mono text-sm">booking.confirmed</code>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <code className="font-mono text-sm">booking.cancelled</code>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <code className="font-mono text-sm">booking.completed</code>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <code className="font-mono text-sm">review.created</code>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <code className="font-mono text-sm">user.registered</code>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <code className="font-mono text-sm">payment.succeeded</code>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <code className="font-mono text-sm">payment.failed</code>
                </li>
              </ul>

              <Link href="/developer/docs/webhooks" className="text-primary hover:underline">
                Learn more about webhook integration →
              </Link>
            </div>

            <div className="rounded-md border bg-card p-6">
              <h2 className="mb-4 text-2xl font-bold">API Versioning</h2>
              <p className="mb-4">
                The API uses URL versioning (e.g., <code className="font-mono">/v1/users</code>).
                When breaking changes are introduced, a new API version will be released.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold">Deprecation process:</h3>
              <ol className="mb-4 ml-5 list-decimal space-y-2">
                <li>Announcement of upcoming changes (at least 3 months in advance)</li>
                <li>Introduction of new version alongside the old one</li>
                <li>Deprecation warning headers in responses from the old version</li>
                <li>Eventual retirement of the old version</li>
              </ol>

              <Link href="/developer/docs/versioning" className="text-primary hover:underline">
                Learn more about API versioning →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
export default function ApiDocumentationPage() {
  return (
    <Suspense fallback={<ApiDocumentationSkeleton />}>
      <ApiDocumentationContent />
    </Suspense>
// Add skeleton component for loading state
function ApiDocumentationSkeleton() {
  return (
    <div className="container-app py-8">
      <div className="animate-pulse">
        <div className="mb-4 h-8 w-64 rounded bg-gray-200"></div>
        <div className="mb-8 h-4 w-full max-w-2xl rounded bg-gray-200"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
    </div>
