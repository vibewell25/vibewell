import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';

// Types for the Live Announcer
interface LiveAnnouncerContextType {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  clear: () => void;
interface LiveAnnouncerProps {
  children: React.ReactNode;
// Create context for the live announcer
const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | null>(null);

/**
 * LiveAnnouncer provider component that wraps your application
 * and provides a way to announce content to screen readers
 */
export function LiveAnnouncerProvider({ children }: LiveAnnouncerProps) {
  const [announcements, setAnnouncements] = useState<
    Array<{ message: string; politeness: 'polite' | 'assertive'; id: number }>
  >([]);
  const [idCounter, setIdCounter] = useState(0);

  // Announce a message to screen readers
  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (!message) return;

    setIdCounter((prevId) => {
      const newId = prevId + 1;
      setAnnouncements((prevAnnouncements) => [
        ...prevAnnouncements,
        { message, politeness, id: newId },
      ]);
      return newId;
// Clean up announcements after they've been read
    // Most screen readers will stop reading when content changes,
    // so we maintain announcements for a short period to ensure they're read
    setTimeout(() => {
      setAnnouncements((prevAnnouncements) =>
        prevAnnouncements.filter((a) => a.message !== message),
10000);
[]);

  // Clear all announcements
  const clear = useCallback(() => {
    setAnnouncements([]);
[]);

  return (
    <LiveAnnouncerContext.Provider value={{ announce, clear }}>
      {children}

      {/* Polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
>
        {announcements
          .filter((a) => a.politeness === 'polite')
          .map((a) => (
            <div key={a.id}>{a.message}</div>
          ))}
      </div>

      {/* Assertive announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
>
        {announcements
          .filter((a) => a.politeness === 'assertive')
          .map((a) => (
            <div key={a.id}>{a.message}</div>
          ))}
      </div>
    </LiveAnnouncerContext.Provider>
/**
 * Hook to use the live announcer
 */
export function useLiveAnnouncer() {
  const context = useContext(LiveAnnouncerContext);

  if (!context) {
    throw new Error('useLiveAnnouncer must be used within a LiveAnnouncerProvider');
return context;
/**
 * Component that announces content changes to screen readers
 */
export function Announce({
  message,
  politeness = 'polite',
  children,
: {
  message: string;
  politeness?: 'polite' | 'assertive';
  children?: React.ReactNode;
) {
  const { announce } = useLiveAnnouncer();

  useEffect(() => {
    if (message) {
      announce(message, politeness);
[message, politeness, announce]);

  return <>{children}</>;
/**
 * Component that announces form errors to screen readers
 */
export function AnnounceFormErrors({
  errors,
  politeness = 'assertive',
: {
  errors: Record<string, string> | null | undefined;
  politeness?: 'polite' | 'assertive';
) {
  const { announce } = useLiveAnnouncer();

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('. ');
      const announcement = `Form contains errors: ${errorMessages}`;
      announce(announcement, politeness);
[errors, announce, politeness]);

  return null;
/**
 * Component that announces loading states to screen readers
 */
export function AnnounceLoadingState({
  isLoading,
  loadingMessage = 'Loading content',
  completedMessage = 'Content loaded',
: {
  isLoading: boolean;
  loadingMessage?: string;
  completedMessage?: string;
) {
  const { announce } = useLiveAnnouncer();
  const [wasLoading, setWasLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      announce(loadingMessage, 'polite');
      setWasLoading(true);
else if (wasLoading) {
      announce(completedMessage, 'polite');
      setWasLoading(false);
[isLoading, loadingMessage, completedMessage, announce, wasLoading]);

  return null;
export default LiveAnnouncerProvider;
