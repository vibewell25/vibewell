import React from 'react';

const testimonials = [
  { id: 1, author: 'Alice', text: 'VibeWell transformed my wellness journey!' },
  { id: 2, author: 'Bob', text: 'Easy booking and great service.' },
  { id: 3, author: 'Carol', text: 'Highly recommend to everyone.' },
];

export default function TestimonialCarousel() {
  return (
    <section className="testimonial-carousel py-16">
      <h2 className="text-3xl font-bold text-center mb-6">Testimonials</h2>
      <div className="flex overflow-x-auto space-x-6 px-4">
        {testimonials.map(item => (
          <blockquote key={item.id} className="flex-shrink-0 w-80 p-6 bg-white rounded-md shadow-md">
            <p className="italic text-lg">“{item.text}”</p>
            <cite className="block mt-4 text-gray-600 text-right">— {item.author}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
