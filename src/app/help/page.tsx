'use client';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { Icons } from '@/components/icons';
export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  // Help categories
  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Icons.BookOpenIcon className="h-8 w-8" />,
      description: 'New to Vibewell? Learn the basics and set up your account.',
      path: '/help/getting-started',
      articles: [
        { title: 'Creating Your Account', path: '/help/getting-started/account-setup' },
        { title: 'Setting Up Your Profile', path: '/help/getting-started/profile-setup' },
        { title: 'Navigating the App', path: '/help/getting-started/navigation' },
      ],
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: <Icons.UserCircleIcon className="h-8 w-8" />,
      description: 'Manage your profile, privacy settings, and subscription details.',
      path: '/help/account',
      articles: [
        { title: 'Changing Your Password', path: '/help/account/change-password' },
        { title: 'Managing Subscriptions', path: '/help/account/subscription-management' },
        { title: 'Two-Factor Authentication', path: '/help/account/two-factor-auth' },
      ],
    },
    {
      id: 'features',
      title: 'Features & Functionality',
      icon: <Icons.SparklesIcon className="h-8 w-8" />,
      description: 'Discover how to use Vibewell features and get the most out of the platform.',
      path: '/help/features',
      articles: [
        { title: 'Wellness Tracking', path: '/help/features/wellness-tracking' },
        { title: 'AR Meditation Experiences', path: '/help/features/ar-meditation' },
        { title: 'Community Engagement', path: '/help/features/community' },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <Icons.ArrowPathIcon className="h-8 w-8" />,
      description: 'Having issues? Find solutions to common problems and technical support.',
      path: '/help/troubleshooting',
      articles: [
        { title: 'App Performance Issues', path: '/help/troubleshooting/performance' },
        { title: 'Login Problems', path: '/help/troubleshooting/login-issues' },
        { title: 'Payment Failures', path: '/help/troubleshooting/payment-issues' },
      ],
    },
  ];
  // FAQs
  const faqs = [
    {
      question: 'How do I reset my password?',
      answer:
        'You can reset your password by visiting the login page and clicking on "Forgot Password". Follow the instructions sent to your email.',
      path: '/help/account/reset-password',
    },
    {
      question: 'Can I use Vibewell on multiple devices?',
      answer:
        'Yes, you can use your Vibewell account on multiple devices. Simply log in with your credentials on each device.',
      path: '/help/account/multiple-devices',
    },
    {
      question: 'How do I cancel my subscription?',
      answer:
        'You can cancel your subscription from your account settings under "Subscriptions". Follow the cancellation instructions.',
      path: '/help/account/cancel-subscription',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes, Vibewell uses industry-standard encryption and security practices to protect your personal information and health data.',
      path: '/help/privacy/data-security',
    },
    {
      question: 'How do I contact customer support?',
      answer:
        'You can contact our support team via email, live chat, or by submitting a support ticket through the app.',
      path: '/help/contact',
    },
  ];
  return (
    <Layout>
      <div className="container-app py-8">
        {/* Hero section with search */}
        <div className="from-primary/20 to-primary/5 mb-12 rounded-xl bg-gradient-to-r p-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold">How can we help you?</h1>
            <p className="mb-8 text-lg">
              Search our knowledge base or browse categories below to find answers to your
              questions.
            </p>
            <div className="relative mx-auto max-w-2xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icons.MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search for help articles..."
                className="h-12 w-full rounded-md pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-0 top-0 h-12 rounded-l-none">Search</Button>
            </div>
          </div>
        </div>
        {/* Categories section */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold">Browse Help Categories</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border bg-card p-6 transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-start">
                  <div className="bg-primary/10 text-primary mr-4 rounded-md p-2">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">{category.title}</h3>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <ul className="mb-4 space-y-2 border-l-2 border-muted pl-4">
                  {category.articles.map((article, index) => (
                    <li key={index}>
                      <Link
                        href={article.path}
                        className="text-primary flex items-center hover:underline"
                      >
                        <span className="mr-2">•</span>
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link href={category.path}>View all {category.title} articles</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
        {/* FAQs section */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 flex items-start text-xl font-semibold">
                  <Icons.QuestionMarkCircleIcon className="text-primary mr-2 h-6 w-6 flex-shrink-0" />
                  <span>{faq.question}</span>
                </h3>
                <p className="mb-3 ml-8 text-muted-foreground">{faq.answer}</p>
                <div className="ml-8">
                  <Link
                    href={faq.path}
                    className="text-primary inline-flex items-center text-sm hover:underline"
                  >
                    Read more
                    <svg
                      className="ml-1 h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Additional resources */}
        <div className="mb-12">
          <h2 className="mb-8 text-3xl font-bold">Additional Resources</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
              <div className="text-primary mb-4">
                <Icons.AcademicCapIcon className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Video Tutorials</h3>
              <p className="mb-4 text-muted-foreground">
                Watch step-by-step guides and tutorials on how to use Vibewell.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/help/tutorials">View Tutorials</Link>
              </Button>
            </div>
            <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
              <div className="text-primary mb-4">
                <Icons.DocumentTextIcon className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-bold">User Manual</h3>
              <p className="mb-4 text-muted-foreground">
                Download our comprehensive user guide for detailed instructions.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/help/manual">View Manual</Link>
              </Button>
            </div>
            <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
              <div className="text-primary mb-4">
                <Icons.ShieldExclamationIcon className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Privacy & Terms</h3>
              <p className="mb-4 text-muted-foreground">
                Learn about our privacy policy, terms of service, and data practices.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/help/privacy-terms">Read Privacy & Terms</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Contact support section */}
        <div className="rounded-xl bg-muted p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Still Need Help?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-lg">
            Our support team is ready to assist you with any questions or issues you may have.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild>
              <Link href="/help/contact">Contact Support</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help/community">Visit Community Forum</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
