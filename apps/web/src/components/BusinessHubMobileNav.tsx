import { Icons } from '@/components/icons';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Same links as in the sidebar
const businessHubLinks = [
  {
    title: 'Overview',
    href: '/business-hub',
    icon: <Icons.BriefcaseIcon className="h-5 w-5" />,
{
    title: 'Marketing',
    href: '/business-hub/marketing',
    icon: <Icons.MegaphoneIcon className="h-5 w-5" />,
{
    title: 'Client Acquisition',
    href: '/business-hub/client-acquisition',
    icon: <Icons.UsersIcon className="h-5 w-5" />,
{
    title: 'Financial Management',
    href: '/business-hub/financial-management',
    icon: <Icons.CurrencyDollarIcon className="h-5 w-5" />,
{
    title: 'Staff Management',
    href: '/business-hub/staff-management',
    icon: <Icons.UserGroupIcon className="h-5 w-5" />,
{
    title: 'Scheduling Optimization',
    href: '/business-hub/scheduling-optimization',
    icon: <Icons.CalendarIcon className="h-5 w-5" />,
];
export function BusinessHubMobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-semibold">Business Hub</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 hover:bg-muted"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        >
          {isOpen ? (
            <Icons.XMarkIcon className="h-6 w-6" />
          ) : (
            <Icons.Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>
      {isOpen && (
        <div className="border-b border-border">
          <nav className="p-2">
            <ul className="space-y-1">
              {businessHubLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center rounded-md px-3 py-2 transition-colors hover:bg-muted ${
                        isActive ? 'text-primary bg-muted font-medium' : 'text-muted-foreground'
`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">{link.icon}</span>
                      <span>{link.title}</span>
                    </Link>
                  </li>
)}
            </ul>
          </nav>
        </div>
      )}
    </div>
