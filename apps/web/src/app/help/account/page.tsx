import { Layout } from '@/components/layout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Icons } from '@/components/icons';
export default function AccountManagementHelp() {
  // Account help articles
  const accountArticles = [
    {
      id: 'password',
      title: 'Password Management',
      icon: <Icons.LockClosedIcon className="h-6 w-6" />,
      description: 'Learn how to change, reset, and secure your password.',
      path: '/help/account/password-management',
      popularTopics: [
        { title: 'Changing your password', path: '/help/account/change-password' },
        { title: 'Resetting a forgotten password', path: '/help/account/reset-password' },
        { title: 'Password requirements', path: '/help/account/password-requirements' },
      ],
{
      id: 'subscription',
      title: 'Subscription & Billing',
      icon: <Icons.CreditCardIcon className="h-6 w-6" />,
      description: 'Manage your subscription plan, payment methods, and billing information.',
      path: '/help/account/subscription-management',
      popularTopics: [
        { title: 'Changing subscription plans', path: '/help/account/change-plan' },
        { title: 'Managing payment methods', path: '/help/account/payment-methods' },
        { title: 'Cancelling your subscription', path: '/help/account/cancel-subscription' },
      ],
{
      id: 'security',
      title: 'Account Security',
      icon: <Icons.ShieldCheckIcon className="h-6 w-6" />,
      description:
        'Protect your account with two-factor authentication and security best practices.',
      path: '/help/account/security',
      popularTopics: [
        { title: 'Setting up two-factor authentication', path: '/help/account/two-factor-auth' },
        { title: 'Security best practices', path: '/help/account/security-best-practices' },
        { title: 'Managing connected devices', path: '/help/account/connected-devices' },
      ],
{
      id: 'profile',
      title: 'Profile Settings',
      icon: <Icons.UserCircleIcon className="h-6 w-6" />,
      description: 'Update your profile information, preferences, and privacy settings.',
      path: '/help/account/profile-settings',
      popularTopics: [
        { title: 'Editing your profile', path: '/help/account/edit-profile' },
        { title: 'Privacy settings', path: '/help/account/privacy-settings' },
        { title: 'Managing your data', path: '/help/account/data-management' },
      ],
{
      id: 'notifications',
      title: 'Notifications & Alerts',
      icon: <Icons.BellIcon className="h-6 w-6" />,
      description: 'Customize your notification preferences for app updates, reminders, and more.',
      path: '/help/account/notifications',
      popularTopics: [
        {
          title: 'Setting notification preferences',
          path: '/help/account/notification-preferences',
{ title: 'Email notification settings', path: '/help/account/email-notifications' },
        { title: 'Push notification troubleshooting', path: '/help/account/push-notifications' },
      ],
{
      id: 'devices',
      title: 'Devices & Sessions',
      icon: <Icons.DevicePhoneMobileIcon className="h-6 w-6" />,
      description: 'Manage connected devices, active sessions, and multi-device synchronization.',
      path: '/help/account/devices',
      popularTopics: [
        { title: 'Viewing active sessions', path: '/help/account/active-sessions' },
        { title: 'Using Vibewell on multiple devices', path: '/help/account/multiple-devices' },
        { title: 'Logging out remotely', path: '/help/account/remote-logout' },
      ],
];
  // Frequently asked questions
  const accountFaqs = [
    {
      question: 'How do I change my email address?',
      answer:
        'To change your email address, go to Profile Settings, click on "Edit Profile", enter your new email address, and confirm by entering your password.',
      path: '/help/account/change-email',
{
      question: 'What happens to my data if I cancel my subscription?',
      answer:
        'Your account data will be retained for 30 days after cancellation. You can reactivate your account during this period. After 30 days, your data may be permanently deleted according to our data retention policy.',
      path: '/help/account/data-after-cancellation',
{
      question: 'How can I delete my account?',
      answer:
        'To delete your account, go to Profile Settings, scroll down to Account Management, click on "Delete Account", and follow the confirmation steps. This action is permanent and cannot be undone.',
      path: '/help/account/delete-account',
{
      question: 'How do I update my payment information?',
      answer:
        'To update your payment details, go to Subscription & Billing, select "Payment Methods", click "Edit" next to your current payment method or "Add New Method" to add a new one.',
      path: '/help/account/update-payment',
];
  return (
    <Layout>
      <div className="container-app py-8">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/help">Help Center</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="/help/account">Account Management</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        {/* Header section */}
        <div className="mb-8 flex items-center gap-3">
          <Link href="/help" className="text-muted-foreground hover:text-foreground">
            <Icons.ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Account Management</h1>
        </div>
        <p className="mb-10 max-w-3xl text-lg text-muted-foreground">
          Learn how to manage your Vibewell account settings, including password changes,
          subscription management, security features, and profile customization.
        </p>
        {/* Main content */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {accountArticles.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="mb-5 flex items-start">
                <div className="bg-primary/10 text-primary mr-4 rounded-md p-2">
                  {category.icon}
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">{category.title}</h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <h4 className="mb-3 text-sm font-medium uppercase text-muted-foreground">
                Popular Topics
              </h4>
              <ul className="mb-4 space-y-2 border-l-2 border-muted pl-4">
                {category.popularTopics.map((topic, index) => (
                  <li key={index}>
                    <Link
                      href={topic.path}
                      className="text-primary flex items-center hover:underline"
                    >
                      <span className="mr-2">•</span>
                      {topic.title}
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
        {/* FAQs section */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {accountFaqs.map((faq, index) => (
              <div key={index} className="rounded-lg border bg-card p-5">
                <h3 className="mb-2 text-lg font-semibold">{faq.question}</h3>
                <p className="mb-3 text-muted-foreground">{faq.answer}</p>
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
            ))}
          </div>
        </div>
        {/* Contact support section */}
        <div className="rounded-xl bg-muted p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Still Have Questions About Your Account?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-lg">
            Our support team is available to help with any account-related issues you may be
            experiencing.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild>
              <Link href="/help/contact">Contact Support</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help/account/security">Review Security Settings</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
