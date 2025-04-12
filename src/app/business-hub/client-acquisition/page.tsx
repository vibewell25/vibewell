'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AcademicCapIcon, 
  LightBulbIcon, 
  RocketLaunchIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout/business-hub-layout';

interface Strategy {
  id: string;
  title: string;
  description: string;
  category: 'lead-generation' | 'retention' | 'referral' | 'reactivation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToImplement: string;
  expectedResults: string;
  steps: string[];
}

function ClientAcquisitionContent() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('all');
  const searchParams = useSearchParams();

  // Client acquisition strategies
  const strategies: Strategy[] = [
    {
      id: '1',
      title: 'First-Time Client Special Offer',
      description: 'Create an irresistible introductory offer that allows new clients to experience your services at a reduced rate.',
      category: 'lead-generation',
      difficulty: 'beginner',
      timeToImplement: '1-2 days',
      expectedResults: 'Increase in new client bookings within 2-4 weeks',
      steps: [
        'Determine a service that showcases your skills but costs less to provide',
        'Set a special price that\'s profitable but attractive (30-50% off regular price)',
        'Create promotional materials for your offer (social posts, in-store signage)',
        'Add an expiration date to create urgency (valid for 30 days)',
        'Track redemptions and conversion to regular services'
      ]
    },
    {
      id: '2',
      title: 'Client Referral Program',
      description: 'Implement a structured program that rewards existing clients for referring friends and family to your business.',
      category: 'referral',
      difficulty: 'beginner',
      timeToImplement: '1 week',
      expectedResults: '15-30% increase in new clients through referrals within 3 months',
      steps: [
        'Decide on referral incentives (discount, free add-on service, products)',
        'Create referral cards or digital codes for tracking',
        'Inform existing clients about the program via email and in person',
        'Thank both the referrer and new client when a referral occurs',
        'Track referral sources to identify your best ambassadors'
      ]
    },
    {
      id: '5',
      title: 'Reactivation Email Campaign',
      description: 'Win back inactive clients with a targeted email campaign offering incentives to return.',
      category: 'reactivation',
      difficulty: 'intermediate',
      timeToImplement: '1-2 weeks',
      expectedResults: '10-15% of inactive clients returning within 2 months',
      steps: [
        'Identify clients who haven\'t visited in 3+ months',
        'Segment inactive clients by previous service type and frequency',
        'Create a "We Miss You" email with personalized service recommendations',
        'Include a time-limited special offer to encourage booking',
        'Follow up with a phone call for high-value previous clients',
        'Track return rates and adapt messaging based on results'
      ]
    }
  ];

  // Filter strategies based on selected category and difficulty
  const filteredStrategies = strategies.filter(strategy => {
    const matchesCategory = activeCategory === 'all' || strategy.category === activeCategory;
    const matchesDifficulty = activeDifficulty === 'all' || strategy.difficulty === activeDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Strategies' },
    { id: 'lead-generation', name: 'Lead Generation' },
    { id: 'retention', name: 'Client Retention' },
    { id: 'referral', name: 'Referral Programs' },
    { id: 'reactivation', name: 'Client Reactivation' }
  ];

  // Difficulty levels for filtering
  const difficultyLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-8 mb-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Client Acquisition Strategies</h1>
            <p className="text-lg mb-6">
              Proven tactics to attract new clients, retain your existing ones, and grow your beauty or wellness business.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Get Personalized Strategy
              </Button>
              <Button variant="outline" className="border-indigo-600 text-indigo-600">
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </div>

        {/* Strategies Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Acquisition & Retention Strategies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStrategies.map(strategy => (
              <div key={strategy.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <h3 className="text-xl font-semibold mb-2">{strategy.title}</h3>
                <p className="text-gray-600 mb-4">{strategy.description}</p>
                <ol className="space-y-2 pl-5 list-decimal mb-4">
                  {strategy.steps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-600">{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ClientAcquisitionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading client acquisition strategies...</div>}>
      <ClientAcquisitionContent />
    </Suspense>
  );
} 