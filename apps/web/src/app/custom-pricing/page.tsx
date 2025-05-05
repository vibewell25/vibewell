import { Suspense, useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/components/icons';
interface FeatureOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  included: boolean;
interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular: boolean;
function CustomPricingContent() {
  // Define feature options with pricing
  const [featureOptions, setFeatureOptions] = useState<FeatureOption[]>([
    // Core Features
    {
      id: 'business-profile',
      name: 'Basic Business Profile',
      description: 'Create your business profile with services, hours, and contact info',
      cost: 0,
      category: 'core',
      included: true,
{
      id: 'booking-management',
      name: 'Appointment Management',
      description: 'Allow clients to book appointments and manage your calendar',
      cost: 5,
      category: 'core',
      included: false,
{
      id: 'review-management',
      name: 'Review Collection & Management',
      description: 'Collect and respond to customer reviews',
      cost: 3,
      category: 'core',
      included: false,
// Marketing Features
    {
      id: 'featured-listing',
      name: 'Featured Listing',
      description: 'Get premium placement in search results and category pages',
      cost: 10,
      category: 'marketing',
      included: false,
{
      id: 'promo-tools',
      name: 'Promotional Tools',
      description: 'Create and manage special offers and promotions',
      cost: 8,
      category: 'marketing',
      included: false,
{
      id: 'social-sharing',
      name: 'Social Media Integration',
      description: 'Share your services and offers directly to social platforms',
      cost: 4,
      category: 'marketing',
      included: false,
// Analytics Features
    {
      id: 'basic-analytics',
      name: 'Basic Analytics',
      description: 'View basic performance metrics for your business',
      cost: 5,
      category: 'analytics',
      included: false,
{
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Get detailed insights on customer behavior and business performance',
      cost: 12,
      category: 'analytics',
      included: false,
{
      id: 'competitor-analysis',
      name: 'Competitor Analysis',
      description: 'See how your business compares to similar providers in your area',
      cost: 15,
      category: 'analytics',
      included: false,
// Advanced Features
    {
      id: 'messaging',
      name: 'Client Messaging',
      description: 'Communicate with clients before and after appointments',
      cost: 7,
      category: 'advanced',
      included: false,
{
      id: 'inventory',
      name: 'Product & Inventory Management',
      description: 'Sell products and manage your inventory',
      cost: 10,
      category: 'advanced',
      included: false,
{
      id: 'staff-management',
      name: 'Staff Management',
      description: 'Add staff members with individual calendars and permissions',
      cost: 8,
      category: 'advanced',
      included: false,
]);
  // Sample pre-defined plans for comparison
  const predefinedPlans: PricingTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Essential tools for small businesses',
      price: 9.99,
      features: ['business-profile', 'booking-management', 'review-management', 'basic-analytics'],
      popular: false,
{
      id: 'professional',
      name: 'Professional',
      description: 'Everything you need to grow your business',
      price: 24.99,
      features: [
        'business-profile',
        'booking-management',
        'review-management',
        'basic-analytics',
        'featured-listing',
        'promo-tools',
        'messaging',
      ],
      popular: true,
{
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Advanced features for established businesses',
      price: 49.99,
      features: [
        'business-profile',
        'booking-management',
        'review-management',
        'advanced-analytics',
        'competitor-analysis',
        'featured-listing',
        'promo-tools',
        'social-sharing',
        'messaging',
        'inventory',
        'staff-management',
      ],
      popular: false,
];
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [annualBilling, setAnnualBilling] = useState<boolean>(false);
  // Set a predefined plan
  const selectPredefinedPlan = (planId: string) => {
    const plan = predefinedPlans.find((p) => p.id === planId);
    if (!plan) return;
    setSelectedPlan(planId);
    // Reset all features
    const resetFeatures = featureOptions.map((option) => ({
      ...option,
      included: false,
));
    // Set included features based on the plan
    const updatedFeatures = resetFeatures.map((option) => ({
      ...option,
      included: plan.features.includes(option.id),
));
    setFeatureOptions(updatedFeatures);
// Toggle feature selection
  const toggleFeature = (featureId: string) => {
    setSelectedPlan('custom');
    const updatedFeatures = featureOptions.map((option) =>
      option.id === featureId ? { ...option, included: !option.included } : option,
setFeatureOptions(updatedFeatures);
// Calculate price based on selected features
  useEffect(() => {
    const basePrice = featureOptions.find((f) => f.id === 'business-profile').cost || 0;
    const additionalCost = featureOptions
      .filter((option) => option.included && option.id !== 'business-profile')
      .reduce((sum, option) => sum + option.cost, 0);
    let calculatedPrice = basePrice + additionalCost;
    // Apply annual discount if selected
    if (annualBilling) {
      calculatedPrice = calculatedPrice * 10; // 10 months for the price of 12
setCustomPrice(calculatedPrice);
[featureOptions, annualBilling]);
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Create Your Custom Plan</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose exactly what features you need and only pay for what you use. Build a plan that
            grows with your business.
          </p>
        </div>
        {/* Pre-defined plans */}
        <div className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Start with a Template or Build from Scratch
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {predefinedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border p-6 transition-all ${
                  selectedPlan === plan.id
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-200'
${plan.popular ? 'relative' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-indigo-500 px-3 py-1 text-xs text-white">
                    Popular
                  </div>
                )}
                <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
                <p className="mb-4 text-gray-600">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">
                    ${annualBilling ? (plan.price * 10).toFixed(2) : plan.price}
                  </span>
                  <span className="text-gray-500">/{annualBilling ? 'year' : 'month'}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {featureOptions
                    .filter((option) => plan.features.includes(option.id))
                    .map((feature) => (
                      <li key={feature.id} className="flex items-start">
                        <Icons.CheckSolid className="mr-2 mt-0.5 h-5 w-5 text-green-500" />
                        <span>{feature.name}</span>
                      </li>
                    ))}
                </ul>
                <Button
                  className={`w-full ${selectedPlan === plan.id ? 'bg-indigo-700' : 'bg-indigo-600'}`}
                  onClick={() => selectPredefinedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <label className="flex cursor-pointer items-center">
              <span className="mr-3 text-gray-700">Monthly Billing</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={annualBilling}
                  onChange={() => setAnnualBilling(!annualBilling)}
                />
                <div
                  className={`h-6 w-12 rounded-full transition-colors ${annualBilling ? 'bg-indigo-600' : 'bg-gray-300'}`}
                ></div>
                <div
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${annualBilling ? 'translate-x-6 transform' : ''}`}
                ></div>
              </div>
              <span className="ml-3 text-gray-700">Annual Billing (Save 16%)</span>
            </label>
          </div>
        </div>
        {/* Custom plan builder */}
        <div className="mb-12 rounded-lg bg-gray-50 p-6">
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Feature selection */}
            <div className="md:w-2/3">
              <h2 className="mb-6 text-2xl font-semibold">Customize Your Plan</h2>
              {['core', 'marketing', 'analytics', 'advanced'].map((category) => (
                <div key={category} className="mb-8">
                  <h3 className="mb-4 text-lg font-medium capitalize">{category} Features</h3>
                  <div className="space-y-4">
                    {featureOptions
                      .filter((option) => option.category === category)
                      .map((feature) => (
                        <div
                          key={feature.id}
                          className={`cursor-pointer rounded-lg border p-4 transition-all ${
                            feature.included
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-200'
`}
                          onClick={() =>
                            feature.id !== 'business-profile' && toggleFeature(feature.id)
>
                          <div className="flex items-start">
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <h4 className="font-medium">{feature.name}</h4>
                                {feature.id === 'business-profile' && (
                                  <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                            <div className="ml-4 flex items-center">
                              <span className="mr-3 font-medium text-gray-700">
                                {feature.cost === 0 ? 'Free' : `$${feature.cost}`}
                              </span>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                                  feature.included ? 'bg-indigo-500' : 'border border-gray-300'
`}
                              >
                                {feature.included && (
                                  <Icons.CheckSolid className="h-3 w-3 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Pricing summary */}
            <div className="md:w-1/3">
              <div className="sticky top-6 rounded-lg border bg-white p-6">
                <h3 className="mb-4 text-xl font-semibold">Your Custom Plan</h3>
                <div className="mb-6">
                  <div className="mb-2 flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span>
                      ${featureOptions.find((f) => f.id === 'business-profile').cost || 0}
                    </span>
                  </div>
                  {featureOptions
                    .filter((option) => option.included && option.id !== 'business-profile')
                    .map((feature) => (
                      <div key={feature.id} className="mb-2 flex justify-between">
                        <span className="text-gray-600">{feature.name}</span>
                        <span>${feature.cost}</span>
                      </div>
                    ))}
                  <div className="my-4 border-t border-gray-200 pt-4">
                    <div className="flex justify-between font-medium">
                      <span>Monthly Total</span>
                      <span>${(customPrice / (annualBilling ? 10 : 1)).toFixed(2)}</span>
                    </div>
                    {annualBilling && (
                      <>
                        <div className="mt-2 flex justify-between text-sm text-green-600">
                          <span>Annual Discount</span>
                          <span>-$${((customPrice / 10) * 2).toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex justify-between font-medium">
                          <span>Annual Total</span>
                          <span>${customPrice.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Button className="mb-4 w-full bg-indigo-600 hover:bg-indigo-700">
                  Subscribe Now
                </Button>
                <p className="text-center text-sm text-gray-500">
                  Cancel or change your plan at any time.
                </p>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="mb-2 font-medium">Included Features:</h4>
                  <ul className="space-y-2">
                    {featureOptions
                      .filter((option) => option.included)
                      .map((feature) => (
                        <li key={feature.id} className="flex items-start text-sm">
                          <Icons.CheckSolid className="mr-2 mt-0.5 h-4 w-4 text-green-500" />
                          <span>{feature.name}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Call to action */}
        <div className="rounded-lg bg-indigo-50 p-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-2xl font-bold">Not sure which plan is right for you?</h2>
            <p className="mb-6">
              Our team can help you customize a plan that perfectly fits your business needs.
            </p>
            <Button variant="outline" className="mr-4">
              See All Features
            </Button>
            <Button>Contact Sales</Button>
          </div>
        </div>
      </div>
    </Layout>
export default function CustomPricing() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <CustomPricingContent />
    </Suspense>
