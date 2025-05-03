'use client';
import React, { Suspense, useState } from 'react';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { useSearchParams } from 'next/navigation';
import { 
import { Icons } from '@/components/icons';
  MagnifyingGlassIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  SquaresPlusIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  FolderIcon,
  PaintBrushIcon,
  ArrowsPointingOutIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CogIcon,
  Bars3Icon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
function ComponentsDocumentationContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  // List of component categories with their components
  const componentCategories = [
    {
      name: 'Layout',
      description: 'Components for structuring your application layout',
      icon: <Icons?.ArrowsPointingOutIcon className="h-6 w-6" />,
      components: [
        { name: 'Container', path: '/developer/docs/components/container' },
        { name: 'Grid', path: '/developer/docs/components/grid' },
        { name: 'Stack', path: '/developer/docs/components/stack' },
        { name: 'Tabs', path: '/developer/docs/components/tabs' },
        { name: 'Card', path: '/developer/docs/components/card' }
      ]
    },
    {
      name: 'Navigation',
      description: 'Components for navigating between pages and content',
      icon: <Icons?.ChevronDoubleRightIcon className="h-6 w-6" />,
      components: [
        { name: 'Breadcrumb', path: '/developer/docs/components/breadcrumb' },
        { name: 'Pagination', path: '/developer/docs/components/pagination' },
        { name: 'Navbar', path: '/developer/docs/components/navbar' },
        { name: 'Sidebar', path: '/developer/docs/components/sidebar' },
      ]
    },
    {
      name: 'Forms',
      description: 'Components for collecting user input and data entry',
      icon: <Icons?.DocumentTextIcon className="h-6 w-6" />,
      components: [
        { name: 'Button', path: '/developer/docs/components/button' },
        { name: 'Input', path: '/developer/docs/components/input' },
        { name: 'Select', path: '/developer/docs/components/select' },
        { name: 'Checkbox', path: '/developer/docs/components/checkbox' },
        { name: 'Radio', path: '/developer/docs/components/radio' },
        { name: 'Switch', path: '/developer/docs/components/switch' },
        { name: 'Textarea', path: '/developer/docs/components/textarea' },
      ]
    },
    {
      name: 'Feedback',
      description: 'Components for providing feedback to users',
      icon: <Icons?.ChatBubbleLeftRightIcon className="h-6 w-6" />,
      components: [
        { name: 'Alert', path: '/developer/docs/components/alert' },
        { name: 'Toast', path: '/developer/docs/components/toast' },
        { name: 'Progress', path: '/developer/docs/components/progress' },
        { name: 'Spinner', path: '/developer/docs/components/spinner' },
      ]
    },
    {
      name: 'Overlays',
      description: 'Components that overlay on the main content',
      icon: <Icons?.SquaresPlusIcon className="h-6 w-6" />,
      components: [
        { name: 'Dialog', path: '/developer/docs/components/dialog' },
        { name: 'Drawer', path: '/developer/docs/components/drawer' },
        { name: 'Popover', path: '/developer/docs/components/popover' },
        { name: 'Tooltip', path: '/developer/docs/components/tooltip' },
      ]
    },
    {
      name: 'Data Display',
      description: 'Components for displaying data in structured formats',
      icon: <Icons?.FolderIcon className="h-6 w-6" />,
      components: [
        { name: 'Table', path: '/developer/docs/components/table' },
        { name: 'Avatar', path: '/developer/docs/components/avatar' },
        { name: 'Badge', path: '/developer/docs/components/badge' },
        { name: 'List', path: '/developer/docs/components/list' },
      ]
    },
  ];
  // Filter components based on search query
  const filteredCategories = searchQuery 
    ? componentCategories?.map(category => ({
        ...category,
        components: category?.components.filter(component => 
          component?.name.toLowerCase().includes(searchQuery?.toLowerCase())
        )
      })).filter(category => category?.components.length > 0)
    : componentCategories;
  return (
    <Layout>
      <div className="container-app py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbItem isFirstItem>
            <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/developer/docs">Documentation</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <span className="text-sm font-medium">Components</span>
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">UI Components</h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore our collection of reusable UI components built with accessibility in mind.
              These components help maintain consistency across the Vibewell platform.
            </p>
          </div>
        </div>
        {/* Search box */}
        <div className="relative max-w-md mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons?.MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search components..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target.value)}
          />
        </div>
        {/* Component categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {filteredCategories?.map((category, index) => (
            <div key={index} className="border rounded-lg p-6 bg-card">
              <div className="flex items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-md text-primary mr-4">
                  {category?.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">{category?.name}</h2>
                  <p className="text-muted-foreground">{category?.description}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {category?.components.map((component, compIndex) => (
                  <Link
                    key={compIndex}
                    href={component?.path}
                    className="flex items-center p-2 hover:bg-muted rounded-md group transition-colors"
                  >
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {component?.name}
                    </span>
                    <Icons?.ChevronRightIcon className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Component principles and guidelines */}
        <div className="bg-muted rounded-lg p-6 border border-border mb-10">
          <h2 className="text-2xl font-bold mb-4">Component Design Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Icons?.CheckCircleIcon className="h-5 w-5 mr-2 text-primary" />
                Accessibility
              </h3>
              <p className="text-muted-foreground">
                All components are built with accessibility in mind, following WCAG standards
                and supporting keyboard navigation, screen readers, and proper color contrast.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Icons?.ArrowPathIcon className="h-5 w-5 mr-2 text-primary" />
                Composability
              </h3>
              <p className="text-muted-foreground">
                Components are designed to work together seamlessly, allowing for flexible 
                composition and predictable behavior when combined.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Icons?.PaintBrushIcon className="h-5 w-5 mr-2 text-primary" />
                Customization
              </h3>
              <p className="text-muted-foreground">
                While maintaining consistency, components allow for customization through
                props, variants, and theming to adapt to different contexts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Icons?.CogIcon className="h-5 w-5 mr-2 text-primary" />
                Consistency
              </h3>
              <p className="text-muted-foreground">
                Components follow consistent patterns for naming, behavior, and styling,
                making them intuitive to use across the application.
              </p>
            </div>
          </div>
        </div>
        {/* Getting started with components */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Getting Started with Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-5 bg-card hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold mb-2">Installation</h3>
              <p className="text-muted-foreground mb-4">
                Learn how to install and set up the component library in your project.
              </p>
              <Button variant="outline" asChild>
                <Link href="/developer/docs/installation">View Installation Guide</Link>
              </Button>
            </div>
            <div className="border rounded-lg p-5 bg-card hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
              <p className="text-muted-foreground mb-4">
                Discover best practices for using components effectively in your application.
              </p>
              <Button variant="outline" asChild>
                <Link href="/developer/docs/best-practices">View Best Practices</Link>
              </Button>
            </div>
            <div className="border rounded-lg p-5 bg-card hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold mb-2">Component Playground</h3>
              <p className="text-muted-foreground mb-4">
                Experiment with components in our interactive playground environment.
              </p>
              <Button variant="outline" asChild>
                <Link href="/developer/playground">Open Playground</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Component status */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Component Status</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y">
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Component
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Version
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href="/developer/docs/components/button" className="text-primary hover:underline">
                      Button
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2?.5 py-0?.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Stable
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    v1?.2.0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    2 months ago
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href="/developer/docs/components/breadcrumb" className="text-primary hover:underline">
                      Breadcrumb
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2?.5 py-0?.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Stable
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    v1?.0.0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    Today
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href="/developer/docs/components/dialog" className="text-primary hover:underline">
                      Dialog
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2?.5 py-0?.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Stable
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    v1?.1.0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    1 month ago
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href="/developer/docs/components/toast" className="text-primary hover:underline">
                      Toast
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2?.5 py-0?.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Beta
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    v0?.9.0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    2 weeks ago
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href="/developer/docs/components/spinner" className="text-primary hover:underline">
                      Spinner
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2?.5 py-0?.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Stable
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    v1?.0.0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    3 months ago
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default function ComponentsDocumentationPage() {
  return (
    <Suspense fallback={<ComponentsDocumentationSkeleton />}>
      <ComponentsDocumentationContent />
    </Suspense>
  );
}
// Add skeleton component for loading state
function ComponentsDocumentationSkeleton() {
  return (
    <div className="container-app py-8">
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-full max-w-2xl bg-gray-200 rounded mb-8"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}