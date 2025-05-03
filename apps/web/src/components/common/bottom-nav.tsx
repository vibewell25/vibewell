import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/social', label: 'Social' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/profile', label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-inner">
      <ul className="flex justify-around">
        {navItems?.map((item) => (
          <li key={item?.href}>
            <Link
              href={item?.href}
              className="hover:text-primary flex flex-col items-center py-2 text-sm text-gray-700"
            >
              {item?.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
