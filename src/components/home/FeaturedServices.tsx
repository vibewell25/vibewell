import React from 'react';

export default function FeaturedServices() {
  const services = [
    { id: 1, name: 'Massage Therapy', description: 'Relax and rejuvenate with our expert therapists.' },
    { id: 2, name: 'Yoga Classes', description: 'Find your balance with guided yoga sessions.' },
    { id: 3, name: 'Meditation Sessions', description: 'Calm your mind with our meditation experts.' },
  ];

  return (
    <section className="featured-services py-16">
      <h2 className="text-3xl font-bold text-center mb-6">Our Featured Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map(service => (
          <div key={service.id} className="p-6 bg-white rounded-md shadow-md">
            <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
