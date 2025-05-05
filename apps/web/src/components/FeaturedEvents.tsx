export default function FeaturedEvents() {
  const events = [
    { id: 1, title: 'Morning Yoga Retreat', date: 'May 1, 2025' },
    { id: 2, title: 'Spa and Wellness Fair', date: 'June 12, 2025' },
    { id: 3, title: 'Mindfulness Workshop', date: 'July 20, 2025' },
  ];

  return (
    <section className="featured-events py-16">
      <h2 className="mb-6 text-center text-3xl font-bold">Upcoming Events</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-md bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold">{event.title}</h3>
            <p className="text-gray-600">{event.date}</p>
          </div>
        ))}
      </div>
    </section>
