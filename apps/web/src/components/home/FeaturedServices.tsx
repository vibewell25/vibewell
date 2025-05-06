export default function FeaturedServices() {
  const services = [
    {
      id: 1,
      name: 'Massage Therapy',
      description: 'Relax and rejuvenate with our expert therapists.',
{ id: 2, name: 'Yoga Classes', description: 'Find your balance with guided yoga sessions.' },
    {
      id: 3,
      name: 'Meditation Sessions',
      description: 'Calm your mind with our meditation experts.',
];

  return (
    <section className="featured-services py-16">
      <h2 className="mb-6 text-center text-3xl font-bold">Our Featured Services</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="rounded-md bg-white p-6 shadow-md">
            <h3 className="mb-2 text-xl font-semibold">{service.name}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
