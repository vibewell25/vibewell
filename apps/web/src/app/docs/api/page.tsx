import { Metadata } from 'next';
import { DocSearch } from '@/components/docs/DocSearch';
import { DocSidebar } from '@/components/docs/DocSidebar';

export {};

interface Endpoint {
  method: string;
  path: string;
  description: string;
  authentication: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
[];
  responses: {
    code: number;
    description: string;
    example?: object;
[];
const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/users',
    description: 'Retrieve a list of users',
    authentication: true,
    parameters: [
      {
        name: 'page',
        type: 'number',
        required: false,
        description: 'Page number for pagination',
{
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of items per page',
],
    responses: [
      {
        code: 200,
        description: 'Successfully retrieved users',
        example: {
          users: [
            {
              id: 'user_123',
              name: 'John Doe',
              email: 'john@example.com',
],
          total: 100,
          page: 1,
          limit: 10,
],
{
    method: 'POST',
    path: '/api/bookings',
    description: 'Create a new booking',
    authentication: true,
    parameters: [
      {
        name: 'serviceId',
        type: 'string',
        required: true,
        description: 'ID of the service to book',
{
        name: 'date',
        type: 'string',
        required: true,
        description: 'Booking date and time (ISO 8601)',
],
    responses: [
      {
        code: 201,
        description: 'Booking created successfully',
{
        code: 400,
        description: 'Invalid request parameters',
],
];

export default function ApiDocumentation() {
  return (
    <div className="flex min-h-screen">
      <DocSidebar className="hidden w-64 lg:block" />

      <main className="flex-1 px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">API Documentation</h1>
            <p className="text-lg text-gray-600">
              Complete documentation for the Vibewell API endpoints.
            </p>
          </div>

          <DocSearch className="mb-8" />

          <div className="space-y-12">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="rounded-lg border p-6">
                <div className="mb-4 flex items-center gap-4">
                  <span
                    className={`rounded px-3 py-1 text-sm font-medium ${
                      endpoint.method === 'GET'
                        ? 'bg-blue-100 text-blue-800'
                        : endpoint.method === 'POST'
                          ? 'bg-green-100 text-green-800'
                          : endpoint.method === 'PUT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
`}
                  >
                    {endpoint.method}
                  </span>
                  <code className="text-sm">{endpoint.path}</code>
                </div>

                <p className="mb-4 text-gray-600">{endpoint.description}</p>

                {endpoint.authentication && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-amber-600">
                      Requires Authentication
                    </span>
                  </div>
                )}

                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-2 text-lg font-semibold">Parameters</h3>
                    <div className="overflow-hidden rounded-md border">
                      <table className="min-w-full divide-y">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              Type
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              Required
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <tr key={paramIndex}>
                              <td className="px-4 py-2 font-mono text-sm">{param.name}</td>
                              <td className="px-4 py-2 text-sm">{param.type}</td>
                              <td className="px-4 py-2 text-sm">{param.required ? 'Yes' : 'No'}</td>
                              <td className="px-4 py-2 text-sm">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-lg font-semibold">Responses</h3>
                  <div className="space-y-4">
                    {endpoint.responses.map((response, responseIndex) => (
                      <div key={responseIndex} className="rounded-md border p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-1 text-sm ${
                              response.code >= 200 && response.code < 300
                                ? 'bg-green-100 text-green-800'
                                : response.code >= 400
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
`}
                          >
                            {response.code}
                          </span>
                          <span className="text-sm text-gray-600">{response.description}</span>
                        </div>
                        {response.example && (
                          <pre className="mt-2 overflow-auto rounded-md bg-gray-50 p-4">
                            <code>{JSON.stringify(response.example, null, 2)}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
