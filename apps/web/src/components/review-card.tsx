import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface ReviewCardProps {
  id: string;
  title: string;
  text: string;
  rating: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  compact?: boolean;
}

export default function ReviewCard({
  id,
  title,
  text,
  rating,
  createdAt,
  customer,
  compact = false,
}: ReviewCardProps) {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      if (i <= rating) {
        stars.push(
          <Star
            key={i}
            className="h-5 w-5 fill-yellow-400 text-yellow-400"
            aria-hidden="true"
            fill="currentColor"
          />,
        );
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-yellow-400" aria-hidden="true" />);
      }
    }
    return stars;
  };

  return (
    <div className={`rounded-lg bg-white p-4 shadow ${compact ? 'mb-2' : 'mb-4'}`}>
      <div className="flex items-start">
        <div className="mr-4 flex-shrink-0">
          {customer.avatar_url ? (
            <Image
              src={customer.avatar_url}
              alt={customer.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-600">
              <span className="text-lg font-medium text-white">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="mb-2 mt-1 flex">{renderStars(rating)}</div>
          <h4 className="mb-1 text-lg font-semibold text-gray-800">{title}</h4>
          {!compact && <p className="text-gray-600">{text}</p>}
          {compact && text.length > 120 ? (
            <p className="text-gray-600">{text.substring(0, 120)}...</p>
          ) : (
            compact && <p className="text-gray-600">{text}</p>
          )}
        </div>
      </div>
    </div>
  );
}
