'use client';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
import { Icons } from '@/components/icons';
  ChevronRightIcon,
  HomeIcon,
  ArrowRightIcon,
  BookOpenIcon,
  UserCircleIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  BellAlertIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
export default function GettingStartedGuides() {
  // List of articles in this category
  const articles = [
    {
      id: 'account-setup',
      title: 'Creating Your Account',
      icon: <Icons.UserCircleIcon className="h-6 w-6" />,
      description: 'Learn how to create and set up your Vibewell account, verify your email, and configure important security settings.',
      path: '/help/getting-started/account-setup',
      timeToRead: '5 min',
    },
    {
      id: 'profile-setup',
      title: 'Setting Up Your Profile',
      icon: <Icons.UserCircleIcon className="h-6 w-6" />,
      description: 'Complete your profile with wellness goals, preferences, and customize your experience on Vibewell.',
      path: '/help/getting-started/profile-setup',
      timeToRead: '4 min',
    },
    {
      id: 'navigation',
      title: 'Navigating the App',
      icon: <Icons.DevicePhoneMobileIcon className="h-6 w-6" />,
      description: 'An overview of the Vibewell interface, main features, and how to navigate between different sections.',
      path: '/help/getting-started/navigation',
      timeToRead: '6 min',
    },
    {
      id: 'notification-setup',
      title: 'Setting Up Notifications',
      icon: <Icons.BellAlertIcon className="h-6 w-6" />,
      description: 'Configure your notification preferences for appointments, wellness reminders, and app updates.',
      path: '/help/getting-started/notification-setup',
      timeToRead: '3 min',
    },
    {
      id: 'privacy-settings',
      title: 'Privacy & Security Settings',
      icon: <Icons.LockClosedIcon className="h-6 w-6" />,
      description: 'Manage your privacy settings, learn about data protection, and set up two-factor authentication.',
      path: '/help/getting-started/privacy-settings',
      timeToRead: '7 min',
    },
    {
      id: 'preferences',
      title: 'Customizing Your Preferences',
      icon: <Icons.CogIcon className="h-6 w-6" />,
      description: 'Personalize your app experience by setting content preferences, theme options, and language settings.',
      path: '/help/getting-started/preferences',
      timeToRead: '4 min',
    },
  ];
  // Popular articles
  const popularArticles = [
    articles[0], // Account Setup
    articles[2], // Navigation
    articles[4], // Privacy Settings
  ];
  return (
    <Layout>
      <div className="container-app py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                <Icons.HomeIcon className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            <li className="flex items-center">
              <Icons.ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              <Link href="/help" className="ml-1 text-muted-foreground hover:text-foreground">
                Help Center
              </Link>
            </li>
            <li className="flex items-center">
              <Icons.ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              <span className="ml-1">Getting Started</span>
            </li>
          </ol>
        </nav>
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <Icons.BookOpenIcon className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold">Getting Started with Vibewell</h1>
            </div>
            <p className="text-lg max-w-3xl mb-6">
              Welcome to Vibewell! These guides will help you set up your account, customize your experience, 
              and navigate the app to make the most of our wellness platform.
            </p>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/help/getting-started/account-setup" className="flex items-center">
                Start with Account Setup
                <Icons.ArrowRightIcon className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - All articles */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">All Getting Started Guides</h2>
            <div className="space-y-4">
              {articles.map((article) => (
                <Link 
                  key={article.id}
                  href={article.path}
                  className="block bg-card rounded-lg border p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start">
                    <div className="mr-4 p-2 bg-primary/10 rounded-md text-primary">
                      {article.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{article.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {article.timeToRead} read
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {article.description}
                      </p>
                      <div className="flex justify-end">
                        <span className="text-primary flex items-center text-sm font-medium">
                          Read article
                          <Icons.ArrowRightIcon className="h-3 w-3 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick start */}
            <div className="bg-card rounded-lg border p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Quick Start Guide</h2>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium mr-3">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Create your account</p>
                    <p className="text-sm text-muted-foreground">
                      Sign up with your email and verify your account
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium mr-3">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Complete your profile</p>
                    <p className="text-sm text-muted-foreground">
                      Add your wellness goals and preferences
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium mr-3">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Set up notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Configure reminders for activities and appointments
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium mr-3">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Explore content & features</p>
                    <p className="text-sm text-muted-foreground">
                      Discover wellness content and AR experiences
                    </p>
                  </div>
                </li>
              </ol>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  asChild
                >
                  <Link href="/help/getting-started/quick-start">
                    View detailed quick start guide
                  </Link>
                </Button>
              </div>
            </div>
            {/* Popular articles */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">Most Popular</h2>
              <ul className="space-y-4">
                {popularArticles.map((article) => (
                  <li key={article.id}>
                    <Link 
                      href={article.path}
                      className="flex items-start group"
                    >
                      <div className="mr-3 p-1.5 bg-muted rounded-md text-muted-foreground group-hover:text-primary transition-colors">
                        {article.icon}
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {article.timeToRead} read
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">Need more help?</h3>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  asChild
                >
                  <Link href="/help/contact">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 