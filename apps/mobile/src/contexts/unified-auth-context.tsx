import React, { createContext, useContext, useState, useEffect } from 'react';
// @ts-ignore: TS defs incomplete for expo-auth-session
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE, REDIRECT_URI, DISCOVERY } from '../config/auth';
import { serverBaseUrl } from '../config';
import { storageKeys } from '../config';

export interface User {
  id: string;
  auth0Id?: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'PROVIDER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  token: string | null;
  signIn: (signup?: boolean) => Promise<boolean>;
  signOut: () => Promise<void>;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user from storage
  useEffect(() => {
    const restore = async () => {
      const token = await AsyncStorage.getItem(storageKeys.AUTH_TOKEN);
      if (token) {
        setAccessToken(token);
        try {
          const resp = await fetch(`${serverBaseUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
if (resp.ok) {
            const json = await resp.json();
            setUser(json.user);
            await AsyncStorage.setItem(storageKeys.USER_DATA, JSON.stringify(json.user));
catch {
          // ignore
setIsLoading(false);
restore();
[]);

  const signIn = async (signup = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Construct Auth0 authorization URL
      const authUrl =
        `${DISCOVERY.authorizationEndpoint}` +
        `?response_type=code` +
        `&client_id=${AUTH0_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=openid profile email` +
        `&audience=${AUTH0_AUDIENCE}` +
        (signup ? `&screen_hint=signup` : '');

      // @ts-ignore: startAsync missing in TS defs
      const result = await AuthSession.startAsync({ authUrl });
      if (result.type !== 'success' || !result.params.code) {
        setIsLoading(false);
        return false;
// Exchange code for tokens
      // @ts-ignore: exchangeCodeAsync missing in TS defs
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: AUTH0_CLIENT_ID,
          code: result.params.code,
          redirectUri: REDIRECT_URI,
DISCOVERY
if (!tokenResult.accessToken) {
        setIsLoading(false);
        return false;
await AsyncStorage.setItem(storageKeys.AUTH_TOKEN, tokenResult.accessToken);
      setAccessToken(tokenResult.accessToken);

      // Fetch user profile
      const resp = await fetch(`${serverBaseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
if (resp.ok) {
        const json = await resp.json();
        setUser(json.user);
        await AsyncStorage.setItem(storageKeys.USER_DATA, JSON.stringify(json.user));
setIsLoading(false);
      return true;
catch (error) {
      console.error('Auth signIn error:', error);
      setIsLoading(false);
      return false;
const signOut = async (): Promise<void> => {
    setIsLoading(true);
    await AsyncStorage.removeItem(storageKeys.AUTH_TOKEN);
    setUser(null);
    setAccessToken(null);
    setIsLoading(false);
const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    token: accessToken,
    signIn,
    signOut,
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
