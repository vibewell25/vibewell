import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FaGoogle, FaFacebook, FaApple, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

// Define available providers
export type SocialProvider = 'google' | 'facebook' | 'apple' | 'twitter' | 'github' | 'linkedin';

// Configuration for each provider
const providerConfig = {
  google: {
    name: 'Google',
    icon: FaGoogle,
    bgColor: 'bg-white hover:bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
facebook: {
    name: 'Facebook',
    icon: FaFacebook,
    bgColor: 'bg-[#1877F2] hover:bg-[#0d6efd]',
    textColor: 'text-white',
    borderColor: 'border-[#1877F2]',
apple: {
    name: 'Apple',
    icon: FaApple,
    bgColor: 'bg-black hover:bg-gray-900',
    textColor: 'text-white',
    borderColor: 'border-black',
twitter: {
    name: 'Twitter',
    icon: FaTwitter,
    bgColor: 'bg-[#1DA1F2] hover:bg-[#0c85d0]',
    textColor: 'text-white',
    borderColor: 'border-[#1DA1F2]',
github: {
    name: 'GitHub',
    icon: FaGithub,
    bgColor: 'bg-[#333] hover:bg-[#24292e]',
    textColor: 'text-white',
    borderColor: 'border-[#333]',
linkedin: {
    name: 'LinkedIn',
    icon: FaLinkedin,
    bgColor: 'bg-[#0A66C2] hover:bg-[#0959ab]',
    textColor: 'text-white',
    borderColor: 'border-[#0A66C2]',
export interface SocialLoginButtonProps {
  provider: SocialProvider;
  onLogin: (provider: SocialProvider) => void;
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
export function SocialLoginButton({
  provider,
  onLogin,
  className,
  iconOnly = false,
  size = 'md',
  loading = false,
: SocialLoginButtonProps) {
  const { name, icon: Icon, bgColor, textColor, borderColor } = providerConfig[provider];

  // Size configurations
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
// Icon size based on button size
  const iconSize = {
    sm: 14,
    md: 18,
    lg: 20,
return (
    <Button
      variant="outline"
      className={cn(
        'relative',
        bgColor,
        textColor,
        `border ${borderColor}`,
        sizeClasses[size],
        iconOnly ? 'w-10 p-0' : 'w-full px-4',
        'flex items-center justify-center gap-2',
        'font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className,
      )}
      onClick={() => onLogin(provider)}
      disabled={loading}
      aria-label={`Sign in with ${name}`}
    >
      <Icon size={iconSize[size]} aria-hidden="true" />
      {!iconOnly && <span>Sign in with {name}</span>}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded bg-black bg-opacity-20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      )}
    </Button>
export interface SocialLoginButtonsProps {
  providers?: SocialProvider[];
  onLogin: (provider: SocialProvider) => void;
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  direction?: 'row' | 'column';
  loading?: SocialProvider | null;
/**
 * SocialLoginButtons - A component for displaying social login options
 *
 * This component provides a consistent interface for social login buttons across the application.
 * It supports multiple providers and can be customized for different sizes and layouts.
 *
 * Usage:
 * ```tsx
 * <SocialLoginButtons
 *   providers={['google', 'facebook', 'apple']}
 *   onLogin={(provider) => handleSocialLogin(provider)}
 * />
 * ```
 */
export function SocialLoginButtons({
  providers = ['google', 'facebook', 'apple', 'twitter', 'github'],
  onLogin,
  className,
  iconOnly = false,
  size = 'md',
  direction = 'row',
  loading = null,
: SocialLoginButtonsProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
        direction === 'column' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
    >
      {providers.map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          onLogin={onLogin}
          iconOnly={iconOnly}
          size={size}
          loading={loading === provider}
          className={direction === 'column' ? 'w-full' : ''}
        />
      ))}
    </div>
export default SocialLoginButtons;
