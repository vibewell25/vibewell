import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy-loaded components
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Settings = React.lazy(() => import('../pages/Settings'));
const SecuritySettings = React.lazy(() => import('../pages/SecuritySettings'));
const PrivacySettings = React.lazy(() => import('../pages/PrivacySettings'));
const NotificationSettings = React.lazy(() => import('../pages/NotificationSettings'));
const PaymentMethods = React.lazy(() => import('../pages/PaymentMethods'));
const Subscriptions = React.lazy(() => import('../pages/Subscriptions'));
const Analytics = React.lazy(() => import('../pages/Analytics'));
const Reports = React.lazy(() => import('../pages/Reports'));

// Auth components
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'));
const TwoFactorSetup = React.lazy(() => import('../pages/auth/TwoFactorSetup'));

// Layout components
const MainLayout = React.lazy(() => import('../layouts/MainLayout'));
const AuthLayout = React.lazy(() => import('../layouts/AuthLayout'));

// Error components
const NotFound = React.lazy(() => import('../pages/errors/NotFound'));
const ErrorBoundary = React.lazy(() => import('../components/common/ErrorBoundary'));

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/2fa-setup" element={<TwoFactorSetup />} />
            </Route>

            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Profile & Settings */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings">
                <Route index element={<Settings />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="privacy" element={<PrivacySettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
              </Route>

              {/* Payment & Subscriptions */}
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route path="/subscriptions" element={<Subscriptions />} />

              {/* Analytics & Reports */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />

              {/* Error Routes */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
export default Router; 