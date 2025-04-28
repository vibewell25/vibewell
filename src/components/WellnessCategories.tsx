export default function WellnessCategories() {
  const categories = [
    { id: 1, name: 'Fitness' },
    { id: 2, name: 'Nutrition' },
    { id: 3, name: 'Mindfulness' },
    { id: 4, name: 'Beauty' },
  ];

  return (
    <section className="wellness-categories py-16">
      <h2 className="mb-6 text-center text-3xl font-bold">Wellness Categories</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-full bg-white p-4 text-center shadow-sm">
            {cat.name}
          </div>
        ))}
      </div>
    </section>
  );
}
