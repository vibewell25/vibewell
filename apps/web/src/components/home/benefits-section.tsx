import React from 'react';
import { CheckCircle } from 'lucide-react';

const benefits = [
  { title: 'Expert Practitioners', desc: 'Certified professionals dedicated to your well-being.' },
  { title: 'Personalized Plans', desc: 'Tailored programs to meet your unique goals.' },
  { title: '24/7 Support', desc: 'Always here to assist you on your wellness journey.' },
];

export default function BenefitsSection() {
  return (
    <section className="benefits-section py-16 bg-white">
      <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits?.map((b, i) => (
          <div key={i} className="flex items-start space-x-4">
            <CheckCircle className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="text-xl font-semibold">{b?.title}</h3>
              <p className="text-gray-600">{b?.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
