'use client';;
// Import SVG component types from React
import type { SVGProps } from 'react';
import { Loader2, Github } from 'lucide-react';

// Import heroicons (using namespaces to avoid conflicts)
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  MessageSquare as Chat,
  User,
  Settings,
  X as Close,
  Menu,
  Calendar,
  MessageCircle as Message,
  Star,
  Activity,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Share,
  Users,
  Video as VideoCamera,
  Clock,
  Download,
  Copy,
  DollarSign,
} from 'lucide-react';

export const Icons = {
  spinner: Loader2,
  gitHub: Github,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  sun: Sun,
  moon: Moon,
  bell: Bell,
  chat: Chat,
  user: User,
  settings: Settings,
  close: Close,
  menu: Menu,
  calendar: Calendar,
  message: Message,
  star: Star,
  activity: Activity,
  checkCircle: CheckCircle,
  mapPin: MapPin,
  share: Share,
  users: Users,
  videoCamera: VideoCamera,
  clock: Clock,
  download: Download,
  copy: Copy,
  dollarSign: DollarSign,
} as const;

export type Icon = typeof Icons;

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

// Create a function to enhance heroicon components with size prop
const enhanceIconWithSize = (Icon: React.FC<SVGProps<SVGSVGElement>>) => {
  return ({ size, ...props }: IconProps) => (
    <Icon width={size || props.width || 24} height={size || props.height || 24} {...props} />
  );
};

// Export individual icons for direct imports
export const {
  spinner: Spinner,
  gitHub: GitHub,
  arrowRight: ArrowRightIcon,
  arrowLeft: ArrowLeftIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  sun: SunIcon,
  moon: MoonIcon,
  bell: BellIcon,
  chat: ChatIcon,
  user: UserIcon,
  settings: SettingsIcon,
  close: CloseIcon,
  menu: MenuIcon,
  calendar: CalendarIcon,
  message: MessageIcon,
  star: StarIcon,
  activity: ActivityIcon,
  checkCircle: CheckCircleIcon,
  mapPin: MapPinIcon,
  share: ShareIcon,
  users: UsersIcon,
  videoCamera: VideoCameraIcon,
  clock: ClockIcon,
  download: DownloadIcon,
  copy: CopyIcon,
  dollarSign: DollarSignIcon,
} = Icons;
