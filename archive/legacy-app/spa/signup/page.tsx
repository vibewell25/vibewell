import { useState } from 'react';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors['firstName'] = 'First name is required';
if (!formData.lastName.trim()) {
      newErrors['lastName'] = 'Last name is required';
if (!formData.email.trim()) {
      newErrors['email'] = 'Email is required';
else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors['email'] = 'Invalid email format';
if (!formData.password) {
      newErrors['password'] = 'Password is required';
else if (formData.password.length < 8) {
      newErrors['password'] = 'Password must be at least 8 characters';
if (formData.password !== formData.confirmPassword) {
      newErrors['confirmPassword'] = 'Passwords do not match';
if (!formData.agreeTerms) {
      newErrors['agreeTerms'] = 'You must agree to the terms and conditions';
setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        alert('Account created successfully!');
        // Redirect would happen here in a real app
1500);
return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Join VibeWell for a better wellness experience</p>
        </div>
        
        <div className="rounded-lg bg-card px-8 py-10 shadow border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm ${
                    errors['firstName'] ? 'border-destructive' : 'border-input'
`}
                />
                {errors['firstName'] && (
                  <p className="mt-1 text-xs text-destructive">{errors['firstName']}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm ${
                    errors['lastName'] ? 'border-destructive' : 'border-input'
`}
                />
                {errors['lastName'] && (
                  <p className="mt-1 text-xs text-destructive">{errors['lastName']}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm ${
                  errors['email'] ? 'border-destructive' : 'border-input'
`}
              />
              {errors['email'] && (
                <p className="mt-1 text-xs text-destructive">{errors['email']}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm ${
                  errors['password'] ? 'border-destructive' : 'border-input'
`}
              />
              {errors['password'] && (
                <p className="mt-1 text-xs text-destructive">{errors['password']}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm ${
                  errors['confirmPassword'] ? 'border-destructive' : 'border-input'
`}
              />
              {errors['confirmPassword'] && (
                <p className="mt-1 text-xs text-destructive">{errors['confirmPassword']}</p>
              )}
            </div>
            
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-input text-primary-600 focus:ring-primary-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeTerms" className="font-medium text-foreground">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Terms and Conditions
                  </a>
                </label>
                {errors['agreeTerms'] && (
                  <p className="mt-1 text-xs text-destructive">{errors['agreeTerms']}</p>
                )}
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/spa/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
