import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
from '@/components/ui/Card';
import Link from 'next/link';
import Image from 'next/image';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import { FinancialNav } from '@/components/financial-nav';
import { Layout } from '@/components/layout';
import { Icons } from '@/components/icons';
interface FinancialTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'budgeting' | 'pricing' | 'tax' | 'reporting' | 'cash-flow';
  premium: boolean;
  url: string;
interface FinancialResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'calculator' | 'checklist';
  category: 'budgeting' | 'pricing' | 'tax' | 'reporting' | 'cash-flow';
  premium: boolean;
export default function FinancialManagementPage() {
  const [activeTab, setActiveTab] = useState('tools');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Financial tools data
  const financialTools: FinancialTool[] = [
    {
      id: 'profit-calculator',
      title: 'Service Profit Calculator',
      description:
        'Calculate the true profit margin for each of your services, including all direct and indirect costs.',
      icon: <Icons.CalculatorIcon className="h-10 w-10 text-green-500" />,
      category: 'pricing',
      premium: false,
      url: '/business-hub/financial-management/tools/profit-calculator',
{
      id: 'pricing-strategy',
      title: 'Pricing Strategy Builder',
      description:
        'Develop a strategic pricing structure that maximizes profitability while remaining competitive.',
      icon: <Icons.CurrencyDollarIcon className="h-10 w-10 text-indigo-500" />,
      category: 'pricing',
      premium: true,
      url: '/business-hub/financial-management/tools/pricing-strategy',
{
      id: 'tax-planner',
      title: 'Tax Planning & Deduction Tracker',
      description:
        'Stay organized throughout the year to maximize deductions and minimize tax liability.',
      icon: <Icons.DocumentTextIcon className="h-10 w-10 text-red-500" />,
      category: 'tax',
      premium: false,
      url: '/business-hub/financial-management/tools/tax-planner',
{
      id: 'cash-flow',
      title: 'Cash Flow Forecasting Tool',
      description:
        'Predict and manage your business cash flow to ensure you always have sufficient operating funds.',
      icon: <Icons.ArrowTrendingUpIcon className="h-10 w-10 text-blue-500" />,
      category: 'cash-flow',
      premium: true,
      url: '/business-hub/financial-management/tools/cash-flow',
{
      id: 'budget-template',
      title: 'Salon & Spa Budget Template',
      description:
        'A comprehensive budgeting template designed specifically for beauty and wellness businesses.',
      icon: <Icons.ClipboardDocumentCheckIcon className="h-10 w-10 text-orange-500" />,
      category: 'budgeting',
      premium: false,
      url: '/business-hub/financial-management/tools/budget-template',
{
      id: 'financial-dashboard',
      title: 'Financial KPI Dashboard',
      description:
        'Track key financial metrics and performance indicators specific to service-based businesses.',
      icon: <Icons.ChartBarIcon className="h-10 w-10 text-purple-500" />,
      category: 'reporting',
      premium: true,
      url: '/business-hub/financial-management/tools/financial-dashboard',
];
  // Financial resources data
  const financialResources: FinancialResource[] = [
    {
      id: '1',
      title: 'Wellness Business Financial Planning Guide',
      description:
        'A comprehensive guide to creating and managing a budget for your beauty or wellness business.',
      type: 'guide',
      category: 'budgeting',
      premium: false,
{
      id: '2',
      title: 'Tax Strategies for Wellness Practitioners',
      description:
        'Learn how to maximize deductions and minimize tax liability specific to the wellness industry.',
      type: 'guide',
      category: 'tax',
      premium: false,
{
      id: '3',
      title: 'Pricing Strategies for Wellness Services',
      description:
        'Learn how to price your services based on the value they provide rather than just covering costs.',
      type: 'guide',
      category: 'pricing',
      premium: false,
{
      id: '4',
      title: 'Cash Flow Management for Wellness Businesses',
      description: 'Strategies for managing cash flow during slow seasons or unexpected downturns.',
      type: 'guide',
      category: 'cash-flow',
      premium: false,
{
      id: '5',
      title: 'Financial Metrics Dashboard for Wellness Providers',
      description: 'Calculate key financial ratios to assess the overall health of your business.',
      type: 'calculator',
      category: 'reporting',
      premium: true,
{
      id: '6',
      title: 'Budgeting Templates for Wellness Entrepreneurs',
      description: 'Ready-to-use budget templates specifically designed for wellness businesses.',
      type: 'template',
      category: 'budgeting',
      premium: false,
{
      id: '7',
      title: 'Profit Maximization Strategies for Wellness Providers',
      description:
        'Apply effective profit-boosting strategies to your wellness business with this practical guide.',
      type: 'guide',
      category: 'pricing',
      premium: true,
];
  // Filter tools based on category
  const filteredTools = financialTools.filter(
    (tool) => selectedCategory === 'all' || tool.category === selectedCategory,
// Filter resources based on category
  const filteredResources = financialResources.filter(
    (resource) => selectedCategory === 'all' || resource.category === selectedCategory,
return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">Business Hub</h1>
        <p className="mb-6 text-gray-600">
          Tools, resources, and education to grow your wellness business
        </p>
        {/* Main Navigation */}
        <BusinessHubNavigation />
        {/* Financial Management Navigation */}
        <FinancialNav />
        {/* Hero Section */}
        <div className="mb-12 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 p-8">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold">Financial Management</h1>
            <p className="mb-6 text-lg">
              Take control of your beauty or wellness business finances with our specialized tools,
              templates, and resources. From pricing and budgeting to tax planning and financial
              reporting, find everything you need to build a profitable and sustainable business.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setActiveTab('tools')}
              >
                <Icons.CalculatorIcon className="mr-2 h-5 w-5" />
                Financial Tools
              </Button>
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => setActiveTab('resources')}
              >
                <Icons.DocumentTextIcon className="mr-2 h-5 w-5" />
                Resources & Guides
              </Button>
            </div>
          </div>
        </div>
        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
              size="sm"
            >
              All Categories
            </Button>
            <Button
              variant={selectedCategory === 'pricing' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('pricing')}
              className={selectedCategory === 'pricing' ? 'bg-green-600 hover:bg-green-700' : ''}
              size="sm"
            >
              Pricing Strategy
            </Button>
            <Button
              variant={selectedCategory === 'budgeting' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('budgeting')}
              className={selectedCategory === 'budgeting' ? 'bg-green-600 hover:bg-green-700' : ''}
              size="sm"
            >
              Budgeting
            </Button>
            <Button
              variant={selectedCategory === 'tax' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('tax')}
              className={selectedCategory === 'tax' ? 'bg-green-600 hover:bg-green-700' : ''}
              size="sm"
            >
              Tax Planning
            </Button>
            <Button
              variant={selectedCategory === 'reporting' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('reporting')}
              className={selectedCategory === 'reporting' ? 'bg-green-600 hover:bg-green-700' : ''}
              size="sm"
            >
              Financial Reporting
            </Button>
            <Button
              variant={selectedCategory === 'cash-flow' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('cash-flow')}
              className={selectedCategory === 'cash-flow' ? 'bg-green-600 hover:bg-green-700' : ''}
              size="sm"
            >
              Cash Flow Management
            </Button>
          </div>
        </div>
        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={activeTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="tools">Financial Tools</TabsTrigger>
            <TabsTrigger value="resources">Resources & Guides</TabsTrigger>
          </TabsList>
          {/* Tools Tab Content */}
          <TabsContent value="tools">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <Card key={tool.id}>
                  <CardHeader>
                    <div className="mb-2 flex items-center space-x-3">
                      <div className="rounded-lg bg-gray-100 p-2">{tool.icon}</div>
                      {tool.premium && (
                        <Badge className="border-amber-200 bg-amber-100 text-amber-800">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href={tool.url} className="w-full">
                      <Button
                        className={`w-full ${tool.premium ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {tool.premium ? 'Upgrade to Access' : 'Use Tool'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Resources Tab Content */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="mb-2 flex items-start justify-between">
                      <Badge
                        className={` ${resource.type === 'guide' ? 'bg-blue-100 text-blue-800' : ''} ${resource.type === 'template' ? 'bg-purple-100 text-purple-800' : ''} ${resource.type === 'calculator' ? 'bg-green-100 text-green-800' : ''} ${resource.type === 'checklist' ? 'bg-orange-100 text-orange-800' : ''} `}
                      >
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Badge>
                      {resource.premium && (
                        <Badge className="bg-amber-100 text-amber-800">Premium</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link
                      href={`/business-hub/financial-management/resources/${resource.id}`}
                      className="w-full"
                    >
                      <Button
                        className={`w-full ${resource.premium ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {resource.premium ? 'Upgrade to Access' : 'View Resource'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        {/* Profit Analysis CTA */}
        <div className="mb-12 mt-12 rounded-xl border border-gray-200 bg-white p-8 shadow-md">
          <div className="flex flex-col items-center md:flex-row">
            <div className="md:w-2/3 md:pr-8">
              <h2 className="mb-4 text-2xl font-bold">Get a Custom Profit Analysis</h2>
              <p className="mb-4 text-gray-700">
                Let our financial experts analyze your beauty or wellness business and identify
                opportunities to increase profitability, optimize pricing, and improve your overall
                financial health.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Detailed service profitability breakdown</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Benchmark comparison to similar businesses</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Personalized action plan to increase profit</span>
                </li>
              </ul>
              <Button className="bg-green-600 hover:bg-green-700">
                Schedule Free Consultation
              </Button>
            </div>
            <div className="mt-6 flex justify-center md:mt-0 md:w-1/3">
              <Image
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f"
                alt="Financial Analysis"
                width={300}
                height={250}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
        {/* Financial Insights */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Key Financial Insights</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Industry Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700">
                  How does your business compare to industry standards? Review these key financial
                  metrics:
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between">
                      <span className="text-sm font-medium">Labor Costs</span>
                      <span className="text-sm text-gray-500">35-45% of revenue</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between">
                      <span className="text-sm font-medium">Product Costs</span>
                      <span className="text-sm text-gray-500">8-12% of revenue</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between">
                      <span className="text-sm font-medium">Net Profit Margin</span>
                      <span className="text-sm text-gray-500">8-15% of revenue</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/business-hub/financial-management/benchmarks" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Full Benchmark Report
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Common Financial Mistakes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700">
                  Avoid these frequent financial pitfalls that affect beauty and wellness
                  businesses:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg
                      className="mr-2 mt-0.5 h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Underpricing services without accounting for all costs</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 mt-0.5 h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Not maintaining separate business and personal finances</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 mt-0.5 h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Inadequate cash reserves for seasonal fluctuations</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-2 mt-0.5 h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Missing valuable tax deductions specific to the industry</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/business-hub/financial-management/common-mistakes" className="w-full">
                  <Button variant="outline" className="w-full">
                    Learn How to Avoid These Mistakes
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
        {/* Financial Workshop CTA */}
        <div className="overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-green-600">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 text-white md:w-2/3">
              <h2 className="mb-4 text-2xl font-bold">Free Financial Workshop</h2>
              <p className="mb-6">
                Join our upcoming workshop: "Financial Foundations for Beauty Business Success" and
                learn essential financial strategies specifically for salon, spa, and wellness
                business owners.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-blue-200"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Learn to read and use financial statements</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-blue-200"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Pricing strategies to increase profitability</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-blue-200"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Tax planning tips from industry experts</span>
                </li>
              </ul>
              <Button className="bg-white text-blue-700 hover:bg-blue-50">
                Register Now - Limited Spots
              </Button>
            </div>
            <div className="relative md:w-1/3">
              <div className="h-64 md:h-full">
                <Image
                  src="https://images.unsplash.com/photo-1434626881859-194d67b2b86f"
                  alt="Financial Workshop"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
