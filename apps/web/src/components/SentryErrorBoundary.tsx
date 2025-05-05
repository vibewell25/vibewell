import * as Sentry from '@sentry/nextjs';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
interface State {
  hasError: boolean;
export class SentryErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
              <p className="mb-4 text-gray-600">
                We've been notified and are working to fix the issue.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
              >
                Try again
              </button>
            </div>
          </div>
        )
return this.props.children;
