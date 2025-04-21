'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { spec } from '@/lib/swagger';

export default function ApiDocs() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
      <div className="bg-white rounded-lg shadow">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}
