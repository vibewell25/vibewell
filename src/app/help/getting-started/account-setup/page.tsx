'use client';

import { Layout } from '@/components/layout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  ChevronRightIcon,
  HomeIcon,
  StarIcon,
  BookmarkIcon,
  ShareIcon,
  PrinterIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AccountSetupGuide() {
  // Function to handle printing the article
  const handlePrint = () => {
    window.print();
  };
  
  // Related articles
  const relatedArticles = [
    {
      title: 'Setting Up Your Profile',
      path: '/help/getting-started/profile-setup',
    },
    {
      title: 'Navigating the App',
      path: '/help/getting-started/navigation',
    },
    {
      title: 'Privacy and Security Settings',
      path: '/help/account/privacy',
    },
  ];
  
  return (
    <Layout>
      <div className="container-app py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                <HomeIcon className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              <Link href="/help" className="ml-1 text-muted-foreground hover:text-foreground">
                Help Center
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              <Link 
                href="/help/categories/getting-started" 
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                Getting Started
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              <span className="ml-1">Creating Your Account</span>
            </li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border p-6 mb-8">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold">Creating Your Account</h1>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={handlePrint}>
                    <PrinterIcon className="h-5 w-5" />
                    <span className="sr-only">Print</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <BookmarkIcon className="h-5 w-5" />
                    <span className="sr-only">Bookmark</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ShareIcon className="h-5 w-5" />
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center mb-6 text-sm text-muted-foreground">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>5 min read</span>
                <span className="mx-2">•</span>
                <span>Last updated: June 15, 2023</span>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="lead">
                  Welcome to Vibewell! This guide will walk you through the process of creating your account
                  and getting started with our wellness platform.
                </p>
                
                <h2>Before You Begin</h2>
                <p>
                  Before creating your Vibewell account, make sure you have:
                </p>
                <ul>
                  <li>A valid email address</li>
                  <li>A secure password in mind (at least 8 characters with a mix of letters, numbers, and symbols)</li>
                  <li>A mobile phone for verification (optional but recommended for enhanced security)</li>
                </ul>
                
                <h2>Step 1: Download the App or Visit Our Website</h2>
                <p>
                  You can create a Vibewell account through our mobile app or website:
                </p>
                <ul>
                  <li><strong>Mobile App:</strong> Download the Vibewell app from the App Store (iOS) or Google Play Store (Android)</li>
                  <li><strong>Website:</strong> Visit <a href="https://vibewell.com/signup" className="text-primary hover:underline">vibewell.com/signup</a></li>
                </ul>
                
                <div className="my-6 bg-muted p-4 rounded-md">
                  <h3 className="text-base font-medium mb-2">💡 Pro Tip</h3>
                  <p className="m-0">
                    The mobile app offers additional features like push notifications for appointment reminders and access to AR features, which may not be available on the web version.
                  </p>
                </div>
                
                <h2>Step 2: Sign Up</h2>
                <p>Follow these steps to create your account:</p>
                <ol>
                  <li>Tap/click the "Sign Up" or "Create Account" button</li>
                  <li>Enter your email address</li>
                  <li>Create a strong password</li>
                  <li>Enter your full name</li>
                  <li>Read and accept the Terms of Service and Privacy Policy</li>
                  <li>Click "Create Account"</li>
                </ol>
                
                <h2>Step 3: Verify Your Email</h2>
                <p>
                  After submitting your information, we'll send a verification email to the address you provided.
                </p>
                <ol>
                  <li>Check your email inbox (and spam folder if you don't see it)</li>
                  <li>Open the email from Vibewell with the subject "Verify Your Email"</li>
                  <li>Click the "Verify Email" button or copy and paste the verification link into your browser</li>
                </ol>
                
                <div className="my-6 bg-yellow-50 text-yellow-800 p-4 rounded-md border border-yellow-200">
                  <h3 className="text-base font-medium mb-2">⚠️ Important</h3>
                  <p className="m-0">
                    Your email verification link will expire after 24 hours. If you don't verify within this timeframe, you'll need to request a new verification email.
                  </p>
                </div>
                
                <h2>Step 4: Set Up Two-Factor Authentication (Recommended)</h2>
                <p>
                  For added security, we recommend setting up two-factor authentication (2FA):
                </p>
                <ol>
                  <li>Go to "Account Settings" after logging in</li>
                  <li>Select "Security"</li>
                  <li>Toggle on "Two-Factor Authentication"</li>
                  <li>Choose your preferred 2FA method (SMS or Authenticator App)</li>
                  <li>Follow the on-screen instructions to complete setup</li>
                </ol>
                
                <h2>Step 5: Complete Your Profile</h2>
                <p>
                  To get the most out of Vibewell, we recommend completing your profile:
                </p>
                <ul>
                  <li>Add a profile picture</li>
                  <li>Enter your wellness goals</li>
                  <li>Set your preferences for content and recommendations</li>
                  <li>Connect your wearable devices (optional)</li>
                </ul>
                
                <p>
                  For detailed instructions on setting up your profile, see our guide on 
                  <Link href="/help/getting-started/profile-setup" className="text-primary hover:underline"> Setting Up Your Profile</Link>.
                </p>
                
                <h2>Troubleshooting</h2>
                
                <h3>Common Issues:</h3>
                
                <h4>I didn't receive my verification email</h4>
                <p>
                  If you don't receive your verification email within 15 minutes:
                </p>
                <ul>
                  <li>Check your spam or junk folder</li>
                  <li>Verify you entered the correct email address</li>
                  <li>Click "Resend Verification Email" on the verification page</li>
                  <li>Add noreply@vibewell.com to your contacts or safe senders list</li>
                </ul>
                
                <h4>I forgot my password</h4>
                <p>
                  If you forget your password:
                </p>
                <ol>
                  <li>Click "Forgot Password" on the login screen</li>
                  <li>Enter your email address</li>
                  <li>Check your email for password reset instructions</li>
                  <li>Create a new password</li>
                </ol>
                
                <h2>Need More Help?</h2>
                <p>
                  If you encounter any issues while creating your account, please contact our support team:
                </p>
                <ul>
                  <li>Email: support@vibewell.com</li>
                  <li>Live Chat: Available 24/7 in the app or website</li>
                  <li>Phone: 1-800-VIBEWELL (Available Monday-Friday, 9am-5pm EST)</li>
                </ul>
              </div>
              
              {/* Rating section */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium mb-3">Was this article helpful?</h3>
                <div className="flex space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button 
                      key={rating} 
                      variant="outline" 
                      size="sm"
                      className="p-2"
                    >
                      <StarIcon className="h-5 w-5" />
                      <span className="sr-only">Rate {rating} stars</span>
                    </Button>
                  ))}
                </div>
                <Button variant="outline" className="mr-2">
                  Yes, it helped
                </Button>
                <Button variant="outline">
                  No, I still need help
                </Button>
              </div>
            </div>
            
            {/* Article navigation */}
            <div className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/help" className="flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Help Center
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/help/getting-started/profile-setup" className="flex items-center">
                  Next: Setting Up Your Profile
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Table of Contents */}
            <div className="bg-card rounded-lg border p-4 mb-6 sticky top-4">
              <h2 className="text-lg font-medium mb-3">In This Article</h2>
              <nav>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#before-you-begin" className="text-muted-foreground hover:text-foreground">
                      Before You Begin
                    </a>
                  </li>
                  <li>
                    <a href="#step-1" className="text-muted-foreground hover:text-foreground">
                      Step 1: Download the App or Visit Our Website
                    </a>
                  </li>
                  <li>
                    <a href="#step-2" className="text-muted-foreground hover:text-foreground">
                      Step 2: Sign Up
                    </a>
                  </li>
                  <li>
                    <a href="#step-3" className="text-muted-foreground hover:text-foreground">
                      Step 3: Verify Your Email
                    </a>
                  </li>
                  <li>
                    <a href="#step-4" className="text-muted-foreground hover:text-foreground">
                      Step 4: Set Up Two-Factor Authentication
                    </a>
                  </li>
                  <li>
                    <a href="#step-5" className="text-muted-foreground hover:text-foreground">
                      Step 5: Complete Your Profile
                    </a>
                  </li>
                  <li>
                    <a href="#troubleshooting" className="text-muted-foreground hover:text-foreground">
                      Troubleshooting
                    </a>
                  </li>
                  <li>
                    <a href="#need-more-help" className="text-muted-foreground hover:text-foreground">
                      Need More Help?
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            
            {/* Related Articles */}
            <div className="bg-card rounded-lg border p-4">
              <h2 className="text-lg font-medium mb-3">Related Articles</h2>
              <ul className="space-y-3">
                {relatedArticles.map((article, index) => (
                  <li key={index}>
                    <Link 
                      href={article.path}
                      className="text-primary hover:underline block"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 