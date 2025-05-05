const testimonials = [
  { id: 1, author: 'Alice', text: 'VibeWell transformed my wellness journey!' },
  { id: 2, author: 'Bob', text: 'Easy booking and great service.' },
  { id: 3, author: 'Carol', text: 'Highly recommend to everyone.' },
];

export default function TestimonialCarousel() {
  return (
    <section className="testimonial-carousel py-16">
      <h2 className="mb-6 text-center text-3xl font-bold">Testimonials</h2>
      <div className="flex space-x-6 overflow-x-auto px-4">
        {testimonials.map((item) => (
          <blockquote
            key={item.id}
            className="w-80 flex-shrink-0 rounded-md bg-white p-6 shadow-md"
          >
            <p className="text-lg italic">“{item.text}”</p>
            <cite className="mt-4 block text-right text-gray-600">— {item.author}</cite>
          </blockquote>
        ))}
      </div>
    </section>
