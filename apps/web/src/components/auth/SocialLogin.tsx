import React from 'react';
import { useRouter } from 'next/router';
import { FaGoogle, FaFacebook, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { cn } from '@/lib/utils';

export type SocialProvider = 'google-oauth2' | 'facebook' | 'github';

interface SocialLoginProviderConfig {
  id: SocialProvider;
  name: string;
  icon: IconType;
  className?: string;
  buttonText?: string;
const providers: Record<SocialProvider, SocialLoginProviderConfig> = {
  google: {
    id: 'google',
    name: 'Google',
    icon: FaGoogle,
    className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    className: 'bg-blue-600 text-white hover:bg-blue-700',
twitter: {
    id: 'twitter',
    name: 'Twitter',
    icon: FaTwitter,
    className: 'bg-blue-400 text-white hover:bg-blue-500',
linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: FaLinkedin,
    className: 'bg-blue-700 text-white hover:bg-blue-800',
github: {
    id: 'github',
    name: 'GitHub',
    icon: FaGithub,
    className: 'bg-gray-900 text-white hover:bg-black',
export interface SocialLoginProps {
  provider: SocialProvider;
  label: string;
  icon: React.ReactNode;
export default function SocialLogin({ provider, label, icon }: SocialLoginProps) {
  const router = useRouter();
  
  const handleLogin = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    const searchParams = new URLSearchParams({
      connection: provider,
      returnTo: window.location.origin + (router.query['returnTo'] || '/'),
window.location.href = `/api/auth/login?${searchParams.toString()}`;
return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-2 w-full py-2 px-4 border rounded-lg hover:bg-gray-50 transition-colors"
    >
      {icon}
      <span>Continue with {label}</span>
    </button>
