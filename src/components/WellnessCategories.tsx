import React from 'react';

export default function WellnessCategories() {
  const categories = [
    { id: 1, name: 'Fitness' },
    { id: 2, name: 'Nutrition' },
    { id: 3, name: 'Mindfulness' },
    { id: 4, name: 'Beauty' },
  ];

  return (
    <section className="wellness-categories py-16">
      <h2 className="text-3xl font-bold text-center mb-6">Wellness Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 bg-white rounded-full text-center shadow-sm">
            {cat.name}
          </div>
        ))}
      </div>
    </section>
  );
}
