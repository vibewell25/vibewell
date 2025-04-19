'use client';
import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/contexts/clerk-auth-context';
import { Spinner } from '@/components/ui/spinner';
;
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
function DeveloperContent() {
  const { user, loading } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  // Function to simulate generating an API key
  const generateApiKey = async () => {
    setIsGeneratingKey(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Generate a cryptographically secure API key
    let key = 'vw_';
    // Use Web Crypto API for secure random values in the browser
    const buffer = new Uint8Array(24); // 24 bytes = 48 hex chars
    window.crypto.getRandomValues(buffer);
    key += Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 32); // Limit to 32 chars for readability
    setApiKey(key);
    setIsGeneratingKey(false);
  };
  const resources = [
    {
      id: 'documentation',
      title: 'API Documentation',
      description: 'Comprehensive guides and reference materials for the Vibewell API',
      icon: <Icons.BookOpenIcon className="h-8 w-8 text-indigo-500" />,
      href: '/developer/docs'
    },
    {
      id: 'sdk',
      title: 'SDKs & Libraries',
      description: 'Official client libraries for various programming languages',
      icon: <Icons.CodeBracketIcon className="h-8 w-8 text-violet-500" />,
      href: '/developer/sdk'
    },
    {
      id: 'playground',
      title: 'API Playground',
      description: 'Interactive environment to test API endpoints and explore responses',
      icon: <Icons.BeakerIcon className="h-8 w-8 text-blue-500" />,
      href: '/developer/playground'
    },
    {
      id: 'components',
      title: 'UI Components',
      description: 'Pre-built components to rapidly build Vibewell-compatible interfaces',
      icon: <Icons.SquaresPlusIcon className="h-8 w-8 text-teal-500" />,
      href: '/developer/docs/components'
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      description: 'Configure event notifications for real-time updates',
      icon: <Icons.CursorArrowRaysIcon className="h-8 w-8 text-orange-500" />,
      href: '/developer/webhooks'
    },
    {
      id: 'keys',
      title: 'API Keys',
      description: 'Manage your application credentials and access tokens',
      icon: <Icons.KeyIcon className="h-8 w-8 text-red-500" />,
      href: '/developer/api-keys'
    }
  ];
  const filteredResources = searchQuery
    ? resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resources;
  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="flex justify-center items-center h-[60vh]">
            <Spinner />
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="container-app py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Developer Portal</h1>
            <p className="text-muted-foreground">Build incredible experiences with the Vibewell API</p>
          </div>
          {user && (
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link href="/developer/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Icons.BookOpenIcon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Comprehensive Documentation</CardTitle>
              <CardDescription>
                Detailed guides and reference material for all API endpoints
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/developer/docs">API Documentation</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <Icons.CodeBracketIcon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>SDK & Examples</CardTitle>
              <CardDescription>
                Client libraries, code samples, and integration examples
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/developer/sdk">View SDKs & Code Samples</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <Icons.ShieldCheckIcon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Authentication & Security</CardTitle>
              <CardDescription>
                Learn about secure authentication and best practices
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/developer/security">Security Guidelines</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">UI Components</h2>
          <p className="mb-6">Vibewell offers a comprehensive set of UI components to help you build consistent and accessible interfaces.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start mb-2">
                  <Icons.CodeBracketIcon className="h-6 w-6 mr-3 text-primary" />
                  <div>
                    <h3 className="font-semibold">Breadcrumb</h3>
                    <p className="text-sm text-muted-foreground">
                      Navigation component that helps users understand their location in the app hierarchy
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/developer/docs/components/breadcrumb">View Documentation</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start mb-2">
                  <Icons.CodeBracketIcon className="h-6 w-6 mr-3 text-primary" />
                  <div>
                    <h3 className="font-semibold">Button</h3>
                    <p className="text-sm text-muted-foreground">
                      Core interactive component with multiple variants and sizes
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/developer/docs/components/button">View Documentation</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start mb-2">
                  <Icons.CodeBracketIcon className="h-6 w-6 mr-3 text-primary" />
                  <div>
                    <h3 className="font-semibold">Dialog</h3>
                    <p className="text-sm text-muted-foreground">
                      Modal component for displaying important information or actions
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/developer/docs/components/dialog">View Documentation</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/developer/docs/components">Browse All Components</Link>
            </Button>
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">API Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start mb-2">
                  <Icons.ServerIcon className="h-6 w-6 mr-3 text-primary" />
                  <div>
                    <h3 className="font-semibold">RESTful Endpoints</h3>
                    <p className="text-sm text-muted-foreground">
                      Standard REST API with intuitive resource URIs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start mb-2">
                  <Icons.ArrowPathIcon className="h-6 w-6 mr-3 text-primary" />
                  <div>
                    <h3 className="font-semibold">Rate Limiting</h3>
                    <p className="text-sm text-muted-foreground">
                      Fair usage policy with transparent rate limits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start mb-2">
                  <Icons.CubeIcon className="h-6 w-6 mr-3 text-primary" />
                  <div>
                    <h3 className="font-semibold">Webhook Events</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time notifications for important events
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start mb-2">
                  <Icons.CpuChipIcon className="h-6 w-6 mr-3 text-primary" />
                  <div>
                    <h3 className="font-semibold">Versioned API</h3>
                    <p className="text-sm text-muted-foreground">
                      Stable versioning to prevent breaking changes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Get Started</h2>
          <div className="bg-card border rounded-lg p-6">
            <Tabs defaultValue="register">
              <TabsList className="mb-6">
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="authenticate">Authenticate</TabsTrigger>
                <TabsTrigger value="request">Make Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="register">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">1. Create a Developer Account</h3>
                  <p className="mb-4">Sign up for an account and generate your API keys to start using the Vibewell API.</p>
                  {user ? (
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <Icons.CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                        <p className="font-medium">You're already signed in as {user.email}</p>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Your API Keys</h4>
                        {apiKey ? (
                          <div className="bg-muted p-3 rounded-md font-mono text-sm break-all mb-2">
                            {apiKey}
                          </div>
                        ) : (
                          <Button 
                            onClick={generateApiKey} 
                            disabled={isGeneratingKey}
                            className="mb-2"
                          >
                            {isGeneratingKey ? (
                              <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Generating...
                              </>
                            ) : (
                              'Generate API Key'
                            )}
                          </Button>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Keep your API key secure. Don't commit it to repositories or share it in client-side code.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <Button asChild>
                        <Link href="/auth/sign-in?returnTo=/developer">Sign In to Get Started</Link>
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Register Your Application</h3>
                  <p className="mb-4">Set up your application in the developer dashboard to access the API.</p>
                  {user ? (
                    <Button asChild>
                      <Link href="/developer/dashboard">Go to Developer Dashboard</Link>
                    </Button>
                  ) : (
                    <Button disabled>Sign in first to register your app</Button>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="authenticate">
                <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                <p className="mb-4">The Vibewell API uses JWT tokens for authentication. Include your token in the request headers:</p>
                <div className="bg-muted rounded-md p-4 font-mono text-sm mb-6">
                  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                </div>
                <h4 className="font-medium mb-2">Getting a Token</h4>
                <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto mb-4">
                  <pre>{`POST /auth/sign-in
{
  "email": "user@example.com",
  "password": "yourpassword"
}`}</pre>
                </div>
                <Button asChild variant="outline">
                  <Link href="/developer/docs/authentication">Learn More About Authentication</Link>
                </Button>
              </TabsContent>
              <TabsContent value="request">
                <h3 className="text-lg font-semibold mb-4">Making API Requests</h3>
                <p className="mb-4">Here's a simple example of how to make a request to the Vibewell API:</p>
                <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto mb-6">
                  <pre>{`// JavaScript example
async function getUserProfile() {
  const response = await fetch('https://api.vibewell.com/v1/users/me', {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${jwtToken}\`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(\`API error: \${response.status}\`);
  }
  return await response.json();
}`}</pre>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href="/developer/docs/getting-started">Getting Started Guide</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/developer/examples">View More Examples</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="bg-muted rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="mb-6">Our team is here to help you build with the Vibewell API. Check out these resources or reach out directly.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/developer/faq"
              className="bg-background border border-border rounded-md p-4 hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold flex items-center">
                <Icons.DocumentTextIcon className="h-5 w-5 mr-2 text-primary" />
                FAQs
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Answers to common questions
              </p>
            </Link>
            <Link 
              href="https://github.com/vibewell/api-examples"
              className="bg-background border border-border rounded-md p-4 hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold flex items-center">
                <Icons.CodeBracketIcon className="h-5 w-5 mr-2 text-primary" />
                Sample Code
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Example projects and snippets
              </p>
            </Link>
            <Link 
              href="/contact"
              className="bg-background border border-border rounded-md p-4 hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold flex items-center">
                <Icons.ClockIcon className="h-5 w-5 mr-2 text-primary" />
                Support
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Contact our developer support team
              </p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default function DeveloperPage() {
  return (
    <Suspense fallback={<DeveloperSkeleton />}>
      <DeveloperContent />
    </Suspense>
  );
}
// Add skeleton component for loading state
function DeveloperSkeleton() {
  return (
    <Layout>
      <div className="container-app py-8">
        <div className="animate-pulse">
          <div className="h-10 w-72 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-96 bg-gray-200 rounded mb-8"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
} 