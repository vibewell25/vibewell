import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

export default function SpaHomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-container">
      {/* Welcome section with search */}
      <div className="mb-6">
        <h1 className="app-heading mb-2">Hello, Wellness</h1>
        <p className="app-text mb-4">Find the perfect treatment for your wellbeing</p>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search treatments, providers..."
            className="app-input w-full pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            🔍
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h2 className="app-subheading mb-3">Categories</h2>
        <div className="grid grid-cols-4 gap-3">
          <CategoryItem icon="💆‍♀️" label="Massage" />
          <CategoryItem icon="💅" label="Nails" />
          <CategoryItem icon="💇‍♀️" label="Hair" />
          <CategoryItem icon="✨" label="Facial" />
        </div>
      </div>

      {/* Featured Providers */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="app-subheading">Featured Providers</h2>
          <Link href="/spa/services" className="text-sm text-primary-600">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="app-subheading">Recommendations</h2>
          <Link href="/spa/services" className="text-sm text-primary-600">
            View all
          </Link>
        </div>
        <div className="grid gap-4">
          {recommendations.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-6">
        <h2 className="app-subheading mb-3">Upcoming Appointment</h2>
        {upcomingAppointment ? (
          <div className="app-card">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{upcomingAppointment.serviceName}</h3>
                <p className="text-sm text-muted-foreground">{upcomingAppointment.providerName}</p>
              </div>
              <div className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
                {upcomingAppointment.status}
              </div>
            </div>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">📅</span>
                <span className="text-sm">{upcomingAppointment.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">🕒</span>
                <span className="text-sm">{upcomingAppointment.time}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded-full border border-primary-600 bg-transparent py-2 text-center text-sm font-medium text-primary-600">
                Reschedule
              </button>
              <button className="flex-1 rounded-full bg-primary-600 py-2 text-center text-sm font-medium text-white">
                View Details
              </button>
            </div>
          </div>
        ) : (
          <div className="app-card flex flex-col items-center justify-center py-6 text-center">
            <p className="mb-3 text-muted-foreground">No upcoming appointments</p>
            <Link
              href="/spa/services"
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </div>
function CategoryItem({ icon, label }: { icon: string; label: string }) {
  return (
    <Link href={`/spa/services?category=${label.toLowerCase()}`} className="flex flex-col items-center">
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-2xl text-primary-600">
        {icon}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Link>
type Provider = {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  image?: string;
function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link href={`/spa/providers/${provider.id}`} className="w-40 flex-shrink-0">
      <div className="mb-2 h-40 w-40 overflow-hidden rounded-3xl bg-muted">
        {provider.image && (
          <Image
            src={provider.image}
            alt={provider.name}
            width={160}
            height={160}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <h3 className="font-medium text-foreground">{provider.name}</h3>
      <p className="text-xs text-muted-foreground">{provider.specialty}</p>
      <div className="app-rating mt-1">
        {'★'.repeat(provider.rating)}
        {'☆'.repeat(5 - provider.rating)}
      </div>
    </Link>
type Service = {
  id: number;
  name: string;
  provider: string;
  price: number;
  duration: string;
  image?: string;
  rating: number;
function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/spa/services/${service.id}`} className="app-card flex">
      <div className="mr-4 h-16 w-16 overflow-hidden rounded-2xl bg-muted">
        {service.image && (
          <Image
            src={service.image}
            alt={service.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-foreground">{service.name}</h3>
        <p className="text-xs text-muted-foreground">{service.provider}</p>
        <div className="mt-1 flex items-center justify-between">
          <div className="app-rating text-xs">
            {'★'.repeat(service.rating)}
            {'☆'.repeat(5 - service.rating)}
          </div>
          <div className="text-sm font-medium text-primary-600">
            ${service.price} · {service.duration}
          </div>
        </div>
      </div>
    </Link>
// Sample data
const featuredProviders: Provider[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    specialty: 'Massage Therapist',
    rating: 5,
    image: '/images/avatar-placeholder.jpg',
{
    id: 2,
    name: 'Michael Chen',
    specialty: 'Skincare Expert',
    rating: 4,
    image: '/images/avatar-placeholder.jpg',
{
    id: 3,
    name: 'Emma Wilson',
    specialty: 'Hair Stylist',
    rating: 5,
    image: '/images/avatar-placeholder.jpg',
];

const recommendations: Service[] = [
  {
    id: 1,
    name: 'Deep Tissue Massage',
    provider: 'Sarah Johnson',
    price: 75,
    duration: '60 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 5,
{
    id: 2,
    name: 'Hydrating Facial',
    provider: 'Michael Chen',
    price: 65,
    duration: '45 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 4,
{
    id: 3,
    name: 'Haircut & Style',
    provider: 'Emma Wilson',
    price: 55,
    duration: '60 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 5,
];

const upcomingAppointment = {
  serviceName: 'Deep Tissue Massage',
  providerName: 'Sarah Johnson',
  status: 'Confirmed',
  date: 'May.15, 2023',
  time: '10:00 AM',
