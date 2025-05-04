import React from 'react';

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
}

interface ServiceListProps {
  services: ServiceType[];
}

export default function ServiceList({ services }: ServiceListProps) {
  if (!services.length) {
    return <p className="text-center text-gray-500">No services available in this category.</p>;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {services.map((service) => (
        <li
          key={service.id}
          className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-2">{service.name}</h2>
          {service.images && service.images[0] && (
            <img
              src={service.images[0]}
              alt={service.name}
              className="h-32 w-full object-cover rounded"
            />
          )}
          <p className="mt-2 text-sm text-gray-600">
            {service.description}
          </p>
          <p className="mt-4 font-bold text-primary">
            ${ (service.price / 100).toFixed(2) }
          </p>
        </li>
      ))}
    </ul>
  );
} 