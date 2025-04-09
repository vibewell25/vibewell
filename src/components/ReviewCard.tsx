import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
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
  compact = false
}: ReviewCardProps) {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <StarIcon key={i} className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        );
      }
    }
    
    return stars;
  };
  
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${compact ? 'mb-2' : 'mb-4'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          {customer.avatar_url ? (
            <Image
              src={customer.avatar_url}
              alt={customer.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-medium text-lg">
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
          
          <div className="flex mt-1 mb-2">{renderStars(rating)}</div>
          
          <h4 className="font-semibold text-lg text-gray-800 mb-1">{title}</h4>
          
          {!compact && (
            <p className="text-gray-600">{text}</p>
          )}
          
          {compact && text.length > 120 ? (
            <p className="text-gray-600">{text.substring(0, 120)}...</p>
          ) : compact && (
            <p className="text-gray-600">{text}</p>
          )}
        </div>
      </div>
    </div>
  );
} 