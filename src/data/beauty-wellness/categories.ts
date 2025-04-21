import {
  SparklesIcon,
  ScissorsIcon,
  PaintBrushIcon,
  HandThumbUpIcon,
  HeartIcon,
  SunIcon,
  BeakerIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export const categories = [
  {
    id: 'all',
    name: 'All Services',
    icon: SparklesIcon,
    description: 'Explore our complete range of beauty and wellness services',
    color: 'from-purple-100 to-pink-100',
  },
  {
    id: 'hair',
    name: 'Hair',
    icon: ScissorsIcon,
    description: 'Cuts, colors, styling, and treatments',
    color: 'from-blue-100 to-indigo-100',
  },
  {
    id: 'makeup',
    name: 'Makeup',
    icon: PaintBrushIcon,
    description: 'Professional makeup for any occasion',
    color: 'from-pink-100 to-rose-100',
  },
  {
    id: 'nails',
    name: 'Nails',
    icon: HandThumbUpIcon,
    description: 'Manicures, pedicures, and nail art',
    color: 'from-red-100 to-orange-100',
  },
  {
    id: 'skincare',
    name: 'Skincare',
    icon: BeakerIcon,
    description: 'Facials, treatments, and consultations',
    color: 'from-green-100 to-emerald-100',
  },
  {
    id: 'spa',
    name: 'Spa',
    icon: HeartIcon,
    description: 'Relaxing spa treatments and massages',
    color: 'from-amber-100 to-yellow-100',
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: SunIcon,
    description: 'Holistic wellness and self-care',
    color: 'from-cyan-100 to-sky-100',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: UserGroupIcon,
    description: 'Personal training and group classes',
    color: 'from-violet-100 to-purple-100',
  },
];
