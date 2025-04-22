import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '@/components/ui';
import { getBeautyTutorials, getBeautyArticles, Tutorial, Article } from '@/lib/api/beauty';

export default function BeautyEducation() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContent();
  }, [selectedCategory]);

  const loadContent = async () => {
    try {
      const [tutorialData, articleData] = await Promise.all([
        getBeautyTutorials(selectedCategory),
        getBeautyArticles(selectedCategory)
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
    tutorials: tutorials.filter(tutorial =>
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    articles: articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Beauty Education</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          options={categories}
          className="md:w-48"
        />
        <Input
          placeholder="Search tutorials and articles..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Video Tutorials</h3>
          <div className="space-y-4">
            {filteredContent.tutorials.map(tutorial => (
              <Card key={tutorial.id} className="p-4">
                <div className="aspect-video mb-4">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <h4 className="font-medium">{tutorial.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{tutorial.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={tutorial.instructor.avatar}
                      alt={tutorial.instructor.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm">{tutorial.instructor.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {tutorial.duration} mins
                  </span>
                </div>
                <Button className="w-full mt-4">Watch Tutorial</Button>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Articles & Guides</h3>
          <div className="space-y-4">
            {filteredContent.articles.map(article => (
              <Card key={article.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        {article.readTime} min read
                      </span>
                      <span className="text-sm text-gray-500">
                        By {article.author}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Read Article
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Skincare Basics',
              tips: [
                'Always cleanse before bed',
                'Apply products thin to thick',
                'Don\'t forget sunscreen',
              ],
            },
            {
              title: 'Makeup Essentials',
              tips: [
                'Start with primer',
                'Blend, blend, blend',
                'Clean brushes weekly',
              ],
            },
            {
              title: 'Haircare Must-Knows',
              tips: [
                'Deep condition regularly',
                'Avoid hot tools daily',
                'Trim every 8-12 weeks',
              ],
            },
          ].map(section => (
            <div key={section.title} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">{section.title}</h4>
              <ul className="space-y-2">
                {section.tips.map(tip => (
                  <li key={tip} className="text-sm flex items-center gap-2">
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