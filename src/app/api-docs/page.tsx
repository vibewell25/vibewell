'use client';;
import SwaggerUI from 'swagger-ui-react';
import { spec } from '@/lib/swagger';

export default function ApiDocs() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">API Documentation</h1>
      <div className="rounded-lg bg-white shadow">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}
