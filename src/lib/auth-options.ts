import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || 'dummy-client-id',
      clientSecret: process.env.GITHUB_SECRET || 'dummy-client-secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Verify against environment variables for demo purposes
        // In a real app, you would verify credentials against a database
        const demoEmail = process.env.DEMO_USER_EMAIL || '';
        const demoPassword = process.env.DEMO_USER_PASSWORD || '';
        
        if (!demoEmail || !demoPassword) {
          console.error('Demo credentials not configured in environment variables');
          return null;
        }
        
        if (credentials?.email === demoEmail && credentials.password === demoPassword) {
          return {
            id: '1',
            name: 'Demo User',
            email: demoEmail,
            image: 'https://i.pravatar.cc/150?u=demo@example.com',
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
}; 