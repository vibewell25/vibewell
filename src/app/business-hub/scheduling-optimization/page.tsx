'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarIcon,
  ClockIcon,
  BellAlertIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

// Types
interface SchedulingStrategy {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'efficiency' | 'no-shows' | 'capacity' | 'revenue';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToImplement: string;
  impact: 'low' | 'medium' | 'high';
  steps: string[];
}

interface SchedulingTool {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'efficiency' | 'no-shows' | 'capacity' | 'revenue';
  premium: boolean;
  url: string;
}

export default function SchedulingOptimizationPage() {
  const [activeTab, setActiveTab] = useState('strategies');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  // Scheduling strategies data
  const strategies: SchedulingStrategy[] = [
    {
      id: 'buffer-time',
      title: 'Strategic Buffer Times',
      description: 'Add small buffers between appointments to prevent running behind and reduce stress.',
      icon: <ClockIcon className="h-10 w-10 text-blue-500" />,
      category: 'efficiency',
      difficulty: 'beginner',
      timeToImplement: 'Immediate',
      impact: 'medium',
      steps: [
        'Analyze your most common services and identify realistic timeframes',
        'Add 5-15 minute buffers between appointments based on service complexity',
        'Create separate service duration settings for new vs. returning clients',
        'Consider longer buffers after complex services',
        'Review and adjust buffer times monthly based on actual appointment durations'
      ]
    },
    {
      id: 'batch-services',
      title: 'Service Batching',
      description: 'Group similar services together on specific days to improve efficiency and reduce setup time.',
      icon: <ArrowPathIcon className="h-10 w-10 text-teal-500" />,
      category: 'efficiency',
      difficulty: 'intermediate',
      timeToImplement: '1-2 weeks',
      impact: 'high',
      steps: [
        'Identify services that require similar setup or equipment',
        'Analyze booking patterns to find optimal days for service categories',
        'Block your calendar to dedicate specific days to service types',
        'Communicate changes to clients with positive messaging',
        'Offer incentives for booking during preferred service time blocks',
        'Evaluate efficiency improvements after one month'
      ]
    },
    {
      id: 'deposit-system',
      title: 'Appointment Deposit System',
      description: 'Require a deposit for bookings to reduce no-shows and last-minute cancellations.',
      icon: <CurrencyDollarIcon className="h-10 w-10 text-green-500" />,
      category: 'no-shows',
      difficulty: 'intermediate',
      timeToImplement: '1 week',
      impact: 'high',
      steps: [
        'Decide on appropriate deposit amount (typically 20-50% of service cost)',
        'Update your booking system to accept deposits',
        'Create clear policies for deposit refunds or transfers',
        'Communicate policy to existing clients before implementation',
        'Display deposit requirement prominently on booking page',
        'Track no-show rates before and after implementation'
      ]
    },
    {
      id: 'reminder-sequence',
      title: 'Multi-Touch Reminder System',
      description: 'Implement a series of appointment reminders across multiple channels to minimize no-shows.',
      icon: <BellAlertIcon className="h-10 w-10 text-purple-500" />,
      category: 'no-shows',
      difficulty: 'beginner',
      timeToImplement: '2-3 days',
      impact: 'medium',
      steps: [
        'Set up initial confirmation message immediately after booking',
        'Schedule email reminder 3-5 days before appointment',
        'Send text reminder 24 hours before appointment',
        'Add optional final reminder 2 hours before appointment',
        'Include rescheduling instructions in each reminder',
        'Track which reminder types have highest engagement'
      ]
    },
    {
      id: 'prime-time-pricing',
      title: 'Peak Time Premium Pricing',
      description: 'Charge more for high-demand time slots to maximize revenue during your busiest periods.',
      icon: <ChartBarIcon className="h-10 w-10 text-amber-500" />,
      category: 'revenue',
      difficulty: 'advanced',
      timeToImplement: '2-3 weeks',
      impact: 'high',
      steps: [
        'Analyze booking data to identify your highest-demand time slots',
        'Set premium pricing (10-25% higher) for peak times',
        'Consider offering discounts for less popular times',
        'Create clear communication about time-based pricing',
        'Update your booking system to reflect variable pricing',
        'Review client feedback and booking patterns after implementation',
        'Adjust premium time blocks and pricing quarterly'
      ]
    },
    {
      id: 'capacity-optimization',
      title: 'Capacity Utilization Analysis',
      description: 'Analyze and optimize your schedule to maximize the number of clients you can serve.',
      icon: <UserGroupIcon className="h-10 w-10 text-indigo-500" />,
      category: 'capacity',
      difficulty: 'advanced',
      timeToImplement: '2-4 weeks',
      impact: 'high',
      steps: [
        'Track current capacity utilization (actual bookings vs. maximum possible)',
        'Identify service combinations that optimize chair/room time',
        'Consider adding mini-services to fill small gaps between appointments',
        'Evaluate whether certain services should be shortened, lengthened, or repriced',
        'Create scheduling templates for optimal daily capacity',
        'Train staff on capacity optimization priorities',
        'Review and adjust strategy monthly'
      ]
    },
    {
      id: 'waitlist-system',
      title: 'Smart Waitlist Management',
      description: 'Implement an effective waitlist system to quickly fill cancelled appointments and maximize bookings.',
      icon: <CalendarIcon className="h-10 w-10 text-red-500" />,
      category: 'capacity',
      difficulty: 'intermediate',
      timeToImplement: '1 week',
      impact: 'medium',
      steps: [
        'Set up automated waitlist functionality in your booking system',
        'Create segments in your waitlist based on service type and preferred times',
        'Establish process for immediately notifying waitlist clients of openings',
        'Offer incentives for clients who fill last-minute cancellations',
        'Track waitlist conversion rate and adjust strategy accordingly',
        'Consider premium waitlist options for high-value clients'
      ]
    },
    {
      id: 'cancellation-policy',
      title: 'Effective Cancellation Policy',
      description: 'Create and enforce a cancellation policy that protects your time and revenue.',
      icon: <ExclamationTriangleIcon className="h-10 w-10 text-orange-500" />,
      category: 'no-shows',
      difficulty: 'beginner',
      timeToImplement: '1 day',
      impact: 'medium',
      steps: [
        'Establish clear cancellation timeframe (24-48 hours typically)',
        'Decide on appropriate fee structure for late cancellations',
        'Document policy with clear, friendly language',
        'Require policy acknowledgment during booking process',
        'Train staff on consistent policy enforcement',
        'Implement system for tracking cancellation patterns by client',
        'Review and revise policy based on effectiveness'
      ]
    }
  ];

  // Scheduling tools data
  const tools: SchedulingTool[] = [
    {
      id: '1',
      title: 'Schedule Efficiency Calculator',
      description: 'Analyze your current booking patterns and identify opportunities to optimize your schedule for maximum productivity.',
      image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335',
      category: 'efficiency',
      premium: false,
      url: '/business-hub/scheduling-optimization/efficiency-calculator'
    },
    {
      id: '2',
      title: 'No-Show Rate Tracker',
      description: 'Track and analyze your no-show and late cancellation rates to measure the effectiveness of your policies.',
      image: 'https://images.unsplash.com/photo-1586282391129-76a4ed808dcb',
      category: 'no-shows',
      premium: false,
      url: '/business-hub/scheduling-optimization/no-show-tracker'
    },
    {
      id: '3',
      title: 'Dynamic Pricing Template',
      description: 'Implement time-based pricing with this customizable template that helps you maximize revenue during peak hours.',
      image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74',
      category: 'revenue',
      premium: true,
      url: '/business-hub/scheduling-optimization/dynamic-pricing'
    },
    {
      id: '4',
      title: 'Capacity Utilization Dashboard',
      description: 'Visualize your schedule capacity utilization and identify opportunities to serve more clients.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      category: 'capacity',
      premium: true,
      url: '/business-hub/scheduling-optimization/capacity-dashboard'
    },
    {
      id: '5',
      title: 'Client Communication Templates',
      description: 'Ready-to-use templates for communicating schedule changes, policies, and reminders to clients.',
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624',
      category: 'no-shows',
      premium: false,
      url: '/business-hub/scheduling-optimization/communication-templates'
    },
    {
      id: '6',
      title: 'Revenue Gap Analyzer',
      description: 'Identify missed revenue opportunities in your current scheduling practices with this analytical tool.',
      image: 'https://images.unsplash.com/photo-1611174743420-3d7df880ce32',
      category: 'revenue',
      premium: true,
      url: '/business-hub/scheduling-optimization/revenue-analyzer'
    }
  ];

  // Filter strategies based on selected category and difficulty
  const filteredStrategies = strategies.filter(strategy => {
    const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || strategy.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  // Filter tools based on selected category
  const filteredTools = tools.filter(tool => 
    selectedCategory === 'all' || tool.category === selectedCategory
  );

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'efficiency', name: 'Scheduling Efficiency' },
    { id: 'no-shows', name: 'Reducing No-Shows' },
    { id: 'capacity', name: 'Capacity Optimization' },
    { id: 'revenue', name: 'Revenue Maximization' }
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
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-8 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Scheduling Optimization</h1>
          <p className="text-lg mb-6">
            Maximize your revenue and efficiency with proven scheduling strategies and tools designed 
            for beauty and wellness businesses. Reduce no-shows, optimize booking capacity, and 
            implement effective scheduling policies.
          </p>
          <div className="flex space-x-4">
            <Button 
              variant="default" 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setActiveTab('strategies')}
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Scheduling Strategies
            </Button>
            <Button 
              variant="outline" 
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              onClick={() => setActiveTab('tools')}
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Optimization Tools
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-start mb-2">
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">No-Show Impact</p>
              <h3 className="text-2xl font-bold">$24,000</h3>
            </div>
          </div>
          <p className="text-gray-600">Average annual revenue loss for a beauty business due to no-shows and late cancellations.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-start mb-2">
            <div className="p-2 bg-teal-100 rounded-lg mr-4">
              <ClockIcon className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Time Optimization</p>
              <h3 className="text-2xl font-bold">15-20%</h3>
            </div>
          </div>
          <p className="text-gray-600">Potential increase in service capacity through optimized scheduling strategies.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-start mb-2">
            <div className="p-2 bg-amber-100 rounded-lg mr-4">
              <CurrencyDollarIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Revenue Impact</p>
              <h3 className="text-2xl font-bold">30%+</h3>
            </div>
          </div>
          <p className="text-gray-600">Potential revenue increase from implementing effective scheduling and cancellation policies.</p>
        </div>
      </div>

      {/* Category and Difficulty Filters */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">By Category:</p>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className={selectedCategory === category.id ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">By Difficulty:</p>
            <div className="flex flex-wrap gap-3">
              {difficultyLevels.map(level => (
                <Button
                  key={level.id}
                  variant={selectedDifficulty === level.id ? 'default' : 'outline'}
                  className={selectedDifficulty === level.id ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                  onClick={() => setSelectedDifficulty(level.id)}
                  size="sm"
                >
                  {level.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={activeTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="strategies">Scheduling Strategies</TabsTrigger>
          <TabsTrigger value="tools">Optimization Tools</TabsTrigger>
        </TabsList>
        
        {/* Strategies Tab Content */}
        <TabsContent value="strategies">
          {filteredStrategies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStrategies.map(strategy => (
                <Card key={strategy.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {strategy.icon}
                        </div>
                        <CardTitle className="text-xl">{strategy.title}</CardTitle>
                      </div>
                      
                      <div className="flex space-x-2">
                        {strategy.difficulty === 'beginner' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Beginner</Badge>
                        )}
                        {strategy.difficulty === 'intermediate' && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Intermediate</Badge>
                        )}
                        {strategy.difficulty === 'advanced' && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">Advanced</Badge>
                        )}
                        
                        {strategy.impact === 'high' && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">High Impact</Badge>
                        )}
                      </div>
                    </div>

                    <CardDescription className="text-base">{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Time to Implement</p>
                        <p className="font-medium">{strategy.timeToImplement}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="font-medium capitalize">{strategy.category.replace('-', ' ')}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Implementation Steps:</p>
                      <ol className="space-y-1 pl-5 list-decimal text-sm text-gray-600">
                        {strategy.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/business-hub/scheduling-optimization/strategies/${strategy.id}`} className="w-full">
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        Get Detailed Guide
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies match your filters</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filter criteria</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Tools Tab Content */}
        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <Card key={tool.id} className={`${tool.premium ? 'border-purple-200' : 'border-gray-200'}`}>
                <div className="aspect-video w-full relative overflow-hidden rounded-t-lg">
                  <Image
                    src={tool.image}
                    alt={tool.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  {tool.premium && (
                    <Badge variant="secondary" className="absolute top-2 left-2 bg-purple-100 text-purple-800">
                      Premium
                    </Badge>
                  )}
                  <Badge className="absolute top-2 right-2 bg-indigo-600">
                    {tool.category === 'efficiency' && 'Efficiency'}
                    {tool.category === 'no-shows' && 'No-Shows'}
                    {tool.category === 'capacity' && 'Capacity'}
                    {tool.category === 'revenue' && 'Revenue'}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href={tool.url} className="w-full">
                    <Button 
                      className={`w-full ${tool.premium ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {tool.premium ? 'Unlock Tool' : 'Access Tool'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Call to Action: Schedule Analysis */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-12 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 md:pr-8">
            <h2 className="text-2xl font-bold mb-4">Get a Personalized Schedule Analysis</h2>
            <p className="text-gray-700 mb-4">
              Upload your current schedule and receive a detailed analysis with personalized recommendations 
              to optimize your booking system, reduce gaps, and maximize revenue potential.
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Schedule Free Analysis
            </Button>
          </div>
          <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
              alt="Schedule Analysis"
              width={300}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Cancellation Policy Generator */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Cancellation Policy Generator</h2>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <p className="text-gray-700 mb-6">
            Create a professional, legally-sound cancellation policy tailored to your beauty or wellness business. 
            Our generator creates policies that protect your business while maintaining positive client relationships.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Period Required
              </label>
              <select className="w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option>24 hours</option>
                <option>48 hours</option>
                <option>72 hours</option>
                <option>Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Late Cancellation Fee
              </label>
              <select className="w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option>50% of service price</option>
                <option>Flat fee ($25)</option>
                <option>Full service price</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Generate Policy
            </Button>
          </div>
        </div>
      </div>

      {/* Expert Tips Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Expert Scheduling Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>The Psychology of No-Shows</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Understanding why clients miss appointments is key to preventing them. Learn the psychological 
                factors behind no-shows and how to address them through effective communication strategies.
              </p>
              <Link href="/business-hub/scheduling-optimization/no-show-psychology">
                <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                  Read Full Article
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Setting Boundaries with Chronically Late Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Chronically late clients can disrupt your entire day. Learn how to address tardiness professionally 
                while maintaining client relationships and protecting your schedule.
              </p>
              <Link href="/business-hub/scheduling-optimization/late-clients">
                <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                  View Strategies
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 