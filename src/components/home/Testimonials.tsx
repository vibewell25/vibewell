const testimonials = [
  { id: 1, author: 'Alice', text: 'VibeWell transformed my wellness journey!' },
  { id: 2, author: 'Bob', text: 'Easy booking and great service.' },
  { id: 3, author: 'Carol', text: 'Highly recommend to everyone.' },
];

export default function Testimonials() {
  return (
    <section className="testimonials py-16">
      <h2 className="mb-6 text-center text-3xl font-bold">Testimonials</h2>
      <div className="mx-auto max-w-xl space-y-8">
        {testimonials.map((item) => (
          <blockquote key={item.id} className="text-center">
            <p className="text-lg italic">“{item.text}”</p>
            <cite className="mt-2 block text-gray-600">— {item.author}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
