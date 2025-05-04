import { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '@/components/ui';
import { getBeautyTutorials, getBeautyArticles } from '@/lib/api/beauty';

export default function BeautyEducation() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContent();
  }, [selectedCategory]);

  const loadContent = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const [tutorialData, articleData] = await Promise.all([
        getBeautyTutorials(selectedCategory),
        getBeautyArticles(selectedCategory),
      ]);
      setTutorials(tutorialData);
      setArticles(articleData);
    } catch (error) {
      console.error('Error loading educational content:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'makeup', label: 'Makeup' },
    { value: 'haircare', label: 'Haircare' },
    { value: 'wellness', label: 'Wellness' },
  ];

  const filteredContent = {
    tutorials: tutorials.filter(
      (tutorial) =>
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    articles: articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Beauty Education</h2>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={categories}
          className="md:w-48"
        />
        <Input
          placeholder="Search tutorials and articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-semibold">Video Tutorials</h3>
          <div className="space-y-4">
            {filteredContent.tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="p-4">
                <div className="mb-4 aspect-video">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="h-full w-full rounded object-cover"
                  />
                </div>
                <h4 className="font-medium">{tutorial.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{tutorial.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={tutorial.instructor.avatar}
                      alt={tutorial.instructor.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm">{tutorial.instructor.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{tutorial.duration} mins</span>
                </div>
                <Button className="mt-4 w-full">Watch Tutorial</Button>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-semibold">Articles & Guides</h3>
          <div className="space-y-4">
            {filteredContent.articles.map((article) => (
              <Card key={article.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-24 w-24 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{article.summary}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-sm text-gray-500">{article.readTime} min read</span>
                      <span className="text-sm text-gray-500">By {article.author}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Read Article
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Quick Tips</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: 'Skincare Basics',
              tips: [
                'Always cleanse before bed',
                'Apply products thin to thick',
                "Don't forget sunscreen",
              ],
            },
            {
              title: 'Makeup Essentials',
              tips: ['Start with primer', 'Blend, blend, blend', 'Clean brushes weekly'],
            },
            {
              title: 'Haircare Must-Knows',
              tips: ['Deep condition regularly', 'Avoid hot tools daily', 'Trim every 8-12 weeks'],
            },
          ].map((section) => (
            <div key={section.title} className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium">{section.title}</h4>
              <ul className="space-y-2">
                {section.tips.map((tip) => (
                  <li key={tip} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
