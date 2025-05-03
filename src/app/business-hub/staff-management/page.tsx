'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import {
import { Icons } from '@/components/icons';
  UserGroupIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
// Types
interface ManagementGuide {
  id: string;
  title: string;
  description: string;
  category: 'hiring' | 'training' | 'retention' | 'performance' | 'communication';
  image: string;
  premium: boolean;
}
interface StaffTool {
  id: string;
  title: string;
  description: string;
  icon: React?.ReactNode;
  category: 'hiring' | 'training' | 'retention' | 'performance' | 'communication';
  url: string;
}
interface TrainingResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'template' | 'guide' | 'checklist';
  duration?: string;
  category: 'onboarding' | 'technical' | 'customer-service' | 'sales' | 'management';
}
export default function StaffManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Management guides data
  const managementGuides: ManagementGuide[] = [
    {
      id: '1',
      title: 'How to Hire the Perfect Stylist for Your Salon',
      description: 'A comprehensive guide to finding, interviewing, and assessing potential stylists based on skills, culture fit, and client compatibility.',
      category: 'hiring',
      image: 'https://images?.unsplash.com/photo-1595867818082-083862f3aaf4',
      premium: false
    },
    {
      id: '2',
      title: 'Effective Staff Training Program for Beauty Businesses',
      description: 'Learn how to develop and implement a training program that ensures consistent service quality and staff development.',
      category: 'training',
      image: 'https://images?.unsplash.com/photo-1558403194-611308249627',
      premium: false
    },
    {
      id: '3',
      title: 'Setting Up Performance-Based Commission Structures',
      description: 'Design a fair and motivating commission structure that rewards performance and encourages growth.',
      category: 'performance',
      image: 'https://images?.unsplash.com/photo-1554224155-8d04cb21ed6c',
      premium: true
    },
    {
      id: '4',
      title: 'Reducing Turnover: Staff Retention Strategies',
      description: 'Practical strategies to improve staff satisfaction, engagement, and long-term retention in beauty businesses.',
      category: 'retention',
      image: 'https://images?.unsplash.com/photo-1600880292203-757bb62b4baf',
      premium: false
    },
    {
      id: '5',
      title: 'Effective Team Communication Frameworks',
      description: 'Establish clear communication channels and protocols to ensure your team stays aligned and informed.',
      category: 'communication',
      image: 'https://images?.unsplash.com/photo-1573497161161-c3e73707e25c',
      premium: true
    },
    {
      id: '6',
      title: 'Handling Staff Conflicts and Difficult Conversations',
      description: 'Learn how to address conflicts, provide constructive feedback, and have difficult conversations with staff members.',
      category: 'communication',
      image: 'https://images?.unsplash.com/photo-1573497620053-ea5300f94f21',
      premium: false
    }
  ];
  // Staff tools data
  const staffTools: StaffTool[] = [
    {
      id: 'employee-handbook',
      title: 'Employee Handbook Template',
      description: 'Customizable template for creating a comprehensive employee handbook for your beauty business.',
      icon: <Icons?.DocumentTextIcon className="h-10 w-10 text-indigo-500" />,
      category: 'hiring',
      url: '/business-hub/staff-management/tools/employee-handbook'
    },
    {
      id: 'performance-review',
      title: 'Performance Review Framework',
      description: 'Structured evaluation system for conducting fair and productive staff performance reviews.',
      icon: <Icons?.ChartBarIcon className="h-10 w-10 text-teal-500" />,
      category: 'performance',
      url: '/business-hub/staff-management/tools/performance-review'
    },
    {
      id: 'team-schedules',
      title: 'Team Scheduling Templates',
      description: 'Templates and tools for creating balanced staff schedules that optimize coverage and satisfaction.',
      icon: <Icons?.CalendarIcon className="h-10 w-10 text-blue-500" />,
      category: 'retention',
      url: '/business-hub/staff-management/tools/scheduling-templates'
    },
    {
      id: 'one-on-one',
      title: 'One-on-One Meeting Guide',
      description: 'Framework for conducting effective individual meetings with staff members to improve engagement.',
      icon: <Icons?.ChatBubbleLeftRightIcon className="h-10 w-10 text-purple-500" />,
      category: 'communication',
      url: '/business-hub/staff-management/tools/one-on-one-meetings'
    },
    {
      id: 'compensation-calculator',
      title: 'Compensation & Commission Calculator',
      description: 'Calculate fair and competitive compensation packages and commission structures for your team.',
      icon: <Icons?.CurrencyDollarIcon className="h-10 w-10 text-green-500" />,
      category: 'performance',
      url: '/business-hub/staff-management/tools/compensation-calculator'
    },
    {
      id: 'training-tracker',
      title: 'Staff Training Tracker',
      description: 'Track training progress, certifications, and skill development for each team member.',
      icon: <Icons?.ClipboardDocumentCheckIcon className="h-10 w-10 text-orange-500" />,
      category: 'training',
      url: '/business-hub/staff-management/tools/training-tracker'
    }
  ];
  // Training resources data
  const trainingResources: TrainingResource[] = [
    {
      id: '1',
      title: 'New Employee Onboarding Sequence',
      description: 'A complete 30-day onboarding process for new beauty professionals joining your team.',
      type: 'guide',
      category: 'onboarding'
    },
    {
      id: '2',
      title: 'Client Consultation Excellence',
      description: 'Training video on conducting thorough client consultations that lead to satisfaction and retention.',
      type: 'video',
      duration: '27 min',
      category: 'customer-service'
    },
    {
      id: '3',
      title: 'Retail Sales Training for Beauty Professionals',
      description: 'Learn how to teach your team natural, non-pushy retail recommendation techniques.',
      type: 'video',
      duration: '42 min',
      category: 'sales'
    },
    {
      id: '4',
      title: 'Service Protocol Templates',
      description: 'Standardized service protocols to ensure consistency across all team members.',
      type: 'template',
      category: 'technical'
    },
    {
      id: '5',
      title: 'New Hire Skills Assessment',
      description: 'Comprehensive skill assessment checklist for evaluating new team members.',
      type: 'checklist',
      category: 'onboarding'
    },
    {
      id: '6',
      title: 'Team Leader Development Program',
      description: 'Step-by-step guide to developing senior staff into effective team leaders and managers.',
      type: 'guide',
      category: 'management'
    }
  ];
  // Filter guides based on category and search
  const filteredGuides = managementGuides?.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide?.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      guide?.title.toLowerCase().includes(searchQuery?.toLowerCase()) || 
      guide?.description.toLowerCase().includes(searchQuery?.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  // Filter tools based on category
  const filteredTools = staffTools?.filter(tool => 
    selectedCategory === 'all' || tool?.category === selectedCategory
  );
  // Filter resources based on selected category
  const filteredResources = trainingResources?.filter(resource => 
    selectedCategory === 'all' || 
    (selectedCategory === 'training' && ['onboarding', 'technical', 'customer-service', 'sales', 'management'].includes(resource?.category))
  );
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'hiring', name: 'Hiring & Onboarding' },
    { id: 'training', name: 'Training & Development' },
    { id: 'retention', name: 'Staff Retention' },
    { id: 'performance', name: 'Performance Management' },
    { id: 'communication', name: 'Team Communication' }
  ];
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-100 to-violet-100 rounded-xl p-8 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Staff Management Resources</h1>
          <p className="text-lg mb-6">
            Build, train, and retain an exceptional team with our comprehensive resources for beauty 
            and wellness business owners. From hiring and onboarding to performance management and retention, 
            find everything you need to create a thriving team culture.
          </p>
          <div className="relative w-full max-w-lg mb-6">
            <Input 
              type="text" 
              placeholder="Search staff management resources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target.value)}
              className="pr-10"
            />
            <button className="absolute inset-y-0 right-0 px-3 flex items-center">
              <svg xmlns="http://www?.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Category Filters */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories?.map(category => (
            <Button
              key={category?.id}
              variant={selectedCategory === category?.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category?.id)}
            >
              {category?.name}
            </Button>
          ))}
        </div>
      </div>
      {/* Staff Management Tools */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Staff Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools?.map(tool => (
            <div key={tool?.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    {tool?.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{tool?.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{tool?.description}</p>
                <Link href={tool?.url}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Access Tool
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Management Guides */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Management Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides?.map(guide => (
            <div key={guide?.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="relative h-48">
                <Image
                  src={guide?.image}
                  alt={guide?.title}
                  fill
                  className="object-cover"
                />
                {guide?.premium && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                    Premium
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-2">
                  <Badge className={`
                    ${guide?.category === 'hiring' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${guide?.category === 'training' ? 'bg-blue-100 text-blue-800' : ''}
                    ${guide?.category === 'retention' ? 'bg-purple-100 text-purple-800' : ''}
                    ${guide?.category === 'performance' ? 'bg-amber-100 text-amber-800' : ''}
                    ${guide?.category === 'communication' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {guide?.category === 'hiring' && 'Hiring & Onboarding'}
                    {guide?.category === 'training' && 'Training & Development'}
                    {guide?.category === 'retention' && 'Staff Retention'}
                    {guide?.category === 'performance' && 'Performance Management'}
                    {guide?.category === 'communication' && 'Team Communication'}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{guide?.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{guide?.description}</p>
                <Link href={`/business-hub/staff-management/guides/${guide?.id}`}>
                  <Button 
                    variant={guide?.premium ? 'outline' : 'default'}
                    className={`w-full ${guide?.premium ? 'border-amber-500 text-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {guide?.premium ? 'Upgrade to Access' : 'Read Guide'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Team Success Blueprint */}
      <div className="mb-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Team Success Blueprint</h2>
            <p className="mb-6">
              Our comprehensive program for beauty business owners looking to build and manage high-performing teams. 
              Get access to our complete library of staff management resources, templates, and expert guidance.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3?.707-9?.293a1 1 0 00-1?.414-1?.414L9 10?.586 7?.707 9?.293a1 1 0 00-1?.414 1?.414l2 2a1 1 0 001?.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Complete staff recruitment system</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3?.707-9?.293a1 1 0 00-1?.414-1?.414L9 10?.586 7?.707 9?.293a1 1 0 00-1?.414 1?.414l2 2a1 1 0 001?.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Training programs for all staff roles</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3?.707-9?.293a1 1 0 00-1?.414-1?.414L9 10?.586 7?.707 9?.293a1 1 0 00-1?.414 1?.414l2 2a1 1 0 001?.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Performance management system</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3?.707-9?.293a1 1 0 00-1?.414-1?.414L9 10?.586 7?.707 9?.293a1 1 0 00-1?.414 1?.414l2 2a1 1 0 001?.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Team culture development strategies</span>
              </li>
            </ul>
            <Button className="bg-white text-indigo-700 hover:bg-indigo-100">
              Learn More
            </Button>
          </div>
          <div className="md:w-1/3 relative">
            <div className="h-64 md:h-full">
              <Image
                src="https://images?.unsplash.com/photo-1522202176988-66273c2fd55f"
                alt="Team Success"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Training Resources */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Staff Training Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources?.map(resource => (
            <div key={resource?.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={`
                    ${resource?.type === 'video' ? 'bg-red-100 text-red-800' : ''}
                    ${resource?.type === 'template' ? 'bg-blue-100 text-blue-800' : ''}
                    ${resource?.type === 'guide' ? 'bg-green-100 text-green-800' : ''}
                    ${resource?.type === 'checklist' ? 'bg-amber-100 text-amber-800' : ''}
                  `}>
                    {resource?.type.charAt(0).toUpperCase() + resource?.type.slice(1)}
                  </Badge>
                  {resource?.duration && (
                    <span className="text-xs text-gray-500">{resource?.duration}</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{resource?.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{resource?.description}</p>
              </div>
              <div className="px-6 pb-6 mt-auto">
                <Link href={`/business-hub/staff-management/training/${resource?.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {resource?.type === 'video' ? 'Watch Training' : 
                     resource?.type === 'template' ? 'Download Template' : 
                     resource?.type === 'guide' ? 'View Guide' : 'View Checklist'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Staff Management Expert Consultation */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-12 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 md:pr-8">
            <div className="flex items-center mb-4">
              <Icons?.UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold">Need Personalized Guidance?</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Book a one-on-one consultation with our staff management experts. Get personalized advice 
              on hiring, training, team culture development, and performance management tailored to your 
              specific business needs and challenges.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Book a Consultation
            </Button>
          </div>
          <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
            <Image
              src="https://images?.unsplash.com/photo-1531482615713-2afd69097998"
              alt="Staff Management Expert"
              width={300}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
      {/* Common Team Challenges */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Common Team Challenges & Solutions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Addressing High Staff Turnover</h3>
            <p className="text-gray-600 mb-4">
              Beauty businesses often face higher-than-average turnover rates. Learn the common causes and effective 
              solutions to build a stable, loyal team.
            </p>
            <Link href="/business-hub/staff-management/challenges/turnover">
              <Button variant="outline" className="w-full">
                View Solutions
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Managing Different Experience Levels</h3>
            <p className="text-gray-600 mb-4">
              Strategies for effectively managing and motivating staff with varying levels of experience and skill sets 
              while maintaining team cohesion.
            </p>
            <Link href="/business-hub/staff-management/challenges/experience-levels">
              <Button variant="outline" className="w-full">
                View Strategies
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Motivating Staff During Slow Periods</h3>
            <p className="text-gray-600 mb-4">
              Keep your team engaged, motivated, and productive during seasonal slowdowns or unexpected business lulls.
            </p>
            <Link href="/business-hub/staff-management/challenges/slow-periods">
              <Button variant="outline" className="w-full">
                View Tactics
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Building a Culture of Continuous Learning</h3>
            <p className="text-gray-600 mb-4">
              Create a salon or spa environment where staff are constantly developing their skills and keeping up with 
              industry trends.
            </p>
            <Link href="/business-hub/staff-management/challenges/continuous-learning">
              <Button variant="outline" className="w-full">
                View Framework
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 