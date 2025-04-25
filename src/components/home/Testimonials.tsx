import React from 'react';

const testimonials = [
  { id: 1, author: 'Alice', text: 'VibeWell transformed my wellness journey!' },
  { id: 2, author: 'Bob', text: 'Easy booking and great service.' },
  { id: 3, author: 'Carol', text: 'Highly recommend to everyone.' },
];

export default function Testimonials() {
  return (
    <section className="testimonials py-16">
      <h2 className="text-3xl font-bold text-center mb-6">Testimonials</h2>
      <div className="space-y-8 max-w-xl mx-auto">
        {testimonials.map(item => (
          <blockquote key={item.id} className="text-center">
            <p className="italic text-lg">“{item.text}”</p>
            <cite className="block mt-2 text-gray-600">— {item.author}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
