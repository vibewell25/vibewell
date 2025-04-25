import React from 'react';

export default function FeaturedEvents() {
  const events = [
    { id: 1, title: 'Morning Yoga Retreat', date: 'May 1, 2025' },
    { id: 2, title: 'Spa and Wellness Fair', date: 'June 12, 2025' },
    { id: 3, title: 'Mindfulness Workshop', date: 'July 20, 2025' },
  ];

  return (
    <section className="featured-events py-16">
      <h2 className="text-3xl font-bold text-center mb-6">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.id} className="p-6 bg-white rounded-md shadow-md">
            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600">{event.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
