'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRightIcon,
  AcademicCapIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';

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

export default function ClientAcquisitionPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('all');

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
        'Set a special price that's profitable but attractive (30-50% off regular price)',
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
      id: '3',
      title: 'Strategic Social Media Partnerships',
      description: 'Collaborate with complementary local businesses or influencers to reach new audiences through cross-promotion.',
      category: 'lead-generation',
      difficulty: 'intermediate',
      timeToImplement: '2-4 weeks',
      expectedResults: 'Extended reach to new audiences, 10-20 new client inquiries per partnership',
      steps: [
        'Identify complementary businesses that share your target audience',
        'Reach out with a specific collaboration proposal (content, event, offer)',
        'Create exclusive offers for their audience',
        'Cross-promote on both social platforms with trackable links/codes',
        'Follow up with new clients acquired through partnerships'
      ]
    },
    {
      id: '4',
      title: 'Tiered Loyalty Program',
      description: 'Develop a multi-level rewards program that encourages frequent visits and higher spending.',
      category: 'retention',
      difficulty: 'advanced',
      timeToImplement: '3-4 weeks',
      expectedResults: '25-40% increase in client retention and average spend per visit',
      steps: [
        'Create 3-4 loyalty tiers with increasing benefits',
        'Define clear qualification criteria for each tier',
        'Implement tracking system (app, punch card, or software)',
        'Train staff on promoting and explaining the program',
        'Send regular updates to clients about their status and available rewards',
        'Analyze program data quarterly and adjust as needed'
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
        'Identify clients who haven't visited in 3+ months',
        'Segment inactive clients by previous service type and frequency',
        'Create a "We Miss You" email with personalized service recommendations',
        'Include a time-limited special offer to encourage booking',
        'Follow up with a phone call for high-value previous clients',
        'Track return rates and adapt messaging based on results'
      ]
    },
    {
      id: '6',
      title: 'Google Local Service Ads Campaign',
      description: 'Implement targeted pay-per-lead advertising to capture high-intent local searchers looking for your services.',
      category: 'lead-generation',
      difficulty: 'intermediate',
      timeToImplement: '1-2 weeks',
      expectedResults: '15-25 qualified leads per month based on budget',
      steps: [
        'Set up and verify your Google Business Profile',
        'Complete background checks and license verification',
        'Set your service areas and weekly budget',
        'Create a system for quickly responding to leads',
        'Track conversion from leads to bookings',
        'Adjust budget based on ROI'
      ]
    },
    {
      id: '7',
      title: 'Client Appreciation Events',
      description: 'Host exclusive events for existing clients to increase loyalty while allowing them to introduce friends to your business.',
      category: 'retention',
      difficulty: 'advanced',
      timeToImplement: '4-6 weeks',
      expectedResults: 'Strengthened relationships with top clients, 5-10 new clients per event',
      steps: [
        'Plan an event theme aligned with your brand (education, demonstration, social)',
        'Set a budget and determine if guests will pay a nominal fee',
        'Encourage existing clients to bring a friend with incentives',
        'Prepare exclusive offers available only during the event',
        'Collect contact information from all attendees',
        'Follow up with personalized messages after the event'
      ]
    },
    {
      id: '8',
      title: 'Pre-Booking Incentive System',
      description: 'Encourage clients to book their next appointment before leaving your establishment.',
      category: 'retention',
      difficulty: 'beginner',
      timeToImplement: '1 day',
      expectedResults: '40-60% increase in pre-bookings, reduced no-shows',
      steps: [
        'Create a small but valuable incentive for pre-booking (5-10% off)',
        'Train staff to suggest optimal timing for next appointments',
        'Implement a reminder system (text/email) to reduce no-shows',
        'Track pre-booking conversion rates by service type',
        'Adjust the script and incentives based on results'
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
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-8 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Client Acquisition Strategies</h1>
          <p className="text-lg mb-6">
            Proven tactics to attract new clients, retain your existing ones, and grow your beauty or wellness business. 
            These strategies are specifically designed for service-based businesses in the beauty and wellness industry.
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-start mb-2">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Cost</p>
              <h3 className="text-2xl font-bold">5-10x</h3>
            </div>
          </div>
          <p className="text-gray-600">It costs 5-10 times more to acquire a new client than to retain an existing one.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-start mb-2">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <LightBulbIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Referral Value</p>
              <h3 className="text-2xl font-bold">16%</h3>
            </div>
          </div>
          <p className="text-gray-600">Clients acquired through referrals have a 16% higher lifetime value than other clients.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-start mb-2">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <RocketLaunchIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Retention Impact</p>
              <h3 className="text-2xl font-bold">25-95%</h3>
            </div>
          </div>
          <p className="text-gray-600">Increasing client retention by just 5% can increase profits by 25-95%.</p>
        </div>
      </div>

      {/* Strategy Filters */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Strategies</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <p className="text-sm font-medium text-gray-700 mb-2">By Category:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setActiveCategory(category.id)}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="md:w-1/2">
            <p className="text-sm font-medium text-gray-700 mb-2">By Difficulty:</p>
            <div className="flex flex-wrap gap-2">
              {difficultyLevels.map(level => (
                <Button
                  key={level.id}
                  variant={activeDifficulty === level.id ? 'default' : 'outline'}
                  onClick={() => setActiveDifficulty(level.id)}
                  size="sm"
                >
                  {level.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strategies Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Acquisition & Retention Strategies</h2>
        
        {filteredStrategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStrategies.map(strategy => (
              <div key={strategy.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{strategy.title}</h3>
                  <div>
                    {strategy.difficulty === 'beginner' && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">Beginner</Badge>
                    )}
                    {strategy.difficulty === 'intermediate' && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Intermediate</Badge>
                    )}
                    {strategy.difficulty === 'advanced' && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">Advanced</Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{strategy.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Time to Implement</p>
                    <p className="font-medium">{strategy.timeToImplement}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Results</p>
                    <p className="font-medium">{strategy.expectedResults}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Implementation Steps:</h4>
                  <ol className="space-y-2 pl-5 list-decimal">
                    {strategy.steps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-600">{step}</li>
                    ))}
                  </ol>
                </div>
                
                <Link href={`/business-hub/client-acquisition/strategy/${strategy.id}`}>
                  <Button variant="outline" className="w-full flex justify-between items-center">
                    View Detailed Guide
                    <ChevronRightIcon className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies match your filters</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filter criteria</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveCategory('all');
                setActiveDifficulty('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Loyalty Program Builder */}
      <div className="mb-12">
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-8 mb-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Client Acquisition Strategies</h1>
            <p className="text-lg mb-6">
              Proven tactics to attract new clients, retain your existing ones, and grow your beauty or wellness business. 
              These strategies are specifically designed for service-based businesses in the beauty and wellness industry.
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-start mb-2">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Average Cost</p>
                <h3 className="text-2xl font-bold">5-10x</h3>
              </div>
            </div>
            <p className="text-gray-600">It costs 5-10 times more to acquire a new client than to retain an existing one.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-start mb-2">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <LightBulbIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Referral Value</p>
                <h3 className="text-2xl font-bold">16%</h3>
              </div>
            </div>
            <p className="text-gray-600">Clients acquired through referrals have a 16% higher lifetime value than other clients.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-start mb-2">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <RocketLaunchIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Retention Impact</p>
                <h3 className="text-2xl font-bold">25-95%</h3>
              </div>
            </div>
            <p className="text-gray-600">Increasing client retention by just 5% can increase profits by 25-95%.</p>
          </div>
        </div>

        {/* Strategy Filters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter Strategies</h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <p className="text-sm font-medium text-gray-700 mb-2">By Category:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(category.id)}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="md:w-1/2">
              <p className="text-sm font-medium text-gray-700 mb-2">By Difficulty:</p>
              <div className="flex flex-wrap gap-2">
                {difficultyLevels.map(level => (
                  <Button
                    key={level.id}
                    variant={activeDifficulty === level.id ? 'default' : 'outline'}
                    onClick={() => setActiveDifficulty(level.id)}
                    size="sm"
                  >
                    {level.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strategies Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Acquisition & Retention Strategies</h2>
          
          {filteredStrategies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStrategies.map(strategy => (
                <div key={strategy.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{strategy.title}</h3>
                    <div>
                      {strategy.difficulty === 'beginner' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Beginner</Badge>
                      )}
                      {strategy.difficulty === 'intermediate' && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Intermediate</Badge>
                      )}
                      {strategy.difficulty === 'advanced' && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Advanced</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{strategy.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Time to Implement</p>
                      <p className="font-medium">{strategy.timeToImplement}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expected Results</p>
                      <p className="font-medium">{strategy.expectedResults}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Implementation Steps:</h4>
                    <ol className="space-y-2 pl-5 list-decimal">
                      {strategy.steps.map((step, index) => (
                        <li key={index} className="text-sm text-gray-600">{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <Link href={`/business-hub/client-acquisition/strategy/${strategy.id}`}>
                    <Button variant="outline" className="w-full flex justify-between items-center">
                      View Detailed Guide
                      <ChevronRightIcon className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies match your filters</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filter criteria</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveCategory('all');
                  setActiveDifficulty('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Loyalty Program Builder */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-indigo-100">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-2/3">
                <div className="flex items-center mb-4">
                  <ReceiptPercentIcon className="h-8 w-8 text-indigo-600 mr-3" />
                  <h2 className="text-2xl font-bold">Loyalty Program Builder</h2>
                </div>
                <p className="text-gray-700 mb-6">
                  Create a customized loyalty program tailored to your business type, size, and client base. 
                  Our interactive builder will guide you through setting up a program that increases client 
                  retention and maximizes lifetime value.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Build Your Program
                  </Button>
                  <Button variant="outline" className="border-indigo-600 text-indigo-600">
                    View Templates
                  </Button>
                </div>
              </div>
              <div className="md:w-1/3">
                <Image
                  src="https://images.unsplash.com/photo-1579389083046-e3df9c2b3325"
                  alt="Loyalty Program"
                  width={300}
                  height={200}
                  className="rounded-lg shadow-md"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client Acquisition Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Client Acquisition Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="relative h-40">
                <Image
                  src="https://images.unsplash.com/photo-1552581234-26160f608093"
                  alt="Resource"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">Client Acquisition Budget Calculator</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Plan your marketing budget based on your business goals and client acquisition costs.
                </p>
                <Button variant="outline" className="w-full">Download Template</Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="relative h-40">
                <Image
                  src="https://images.unsplash.com/photo-1551504734-5ee1c4a1479b"
                  alt="Resource"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">Referral Program Templates</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ready-to-use referral cards, email templates, and tracking sheets for your referral program.
                </p>
                <Button variant="outline" className="w-full">Access Templates</Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="relative h-40">
                <Image
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40"
                  alt="Resource"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">Client Retention Email Sequence</h3>
                <p className="text-gray-600 text-sm mb-4">
                  A 5-email sequence to nurture client relationships and encourage repeat bookings.
                </p>
                <Button variant="outline" className="w-full">Get Email Templates</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Consultation */}
        <div className="bg-indigo-600 rounded-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">Need Personalized Client Acquisition Strategy?</h2>
              <p className="mb-6">
                Book a consultation with one of our beauty and wellness business experts. 
                We'll analyze your business, identify opportunities, and create a custom client acquisition 
                plan tailored to your specific goals and budget.
              </p>
              <Button className="bg-white text-indigo-700 hover:bg-gray-100">
                Book a Consultation
              </Button>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">What You'll Get:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5 mr-2">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                    <span>Business assessment & opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5 mr-2">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                    <span>Custom client acquisition strategy</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5 mr-2">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                    <span>3-month implementation plan</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5 mr-2">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                    <span>ROI analysis & projections</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 