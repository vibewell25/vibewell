import { useState, useEffect, useCallback } from 'react';

interface LiveAnnouncerProps {
  politeness?: 'polite' | 'assertive';
// Component for screen reader announcements
const LiveAnnouncer = ({ politeness = 'polite' }: LiveAnnouncerProps) => {
  const [message, setMessage] = useState('');

  const announce = useCallback((text: string) => {
    setMessage(''); // Clear first to ensure announcement on repeated messages
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMessage(text);
[]);

  // Add the announcer to the window object for global access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.announcer = { announce };
return () => {
      if (typeof window !== 'undefined') {
        delete window.announcer;
[announce]);

  return (
    <div aria-live={politeness} aria-atomic="true" className="sr-only">
      {message}
    </div>
export default LiveAnnouncer;

// Type definition for the global announcer
declare global {
  interface Window {
    announcer?: {
      announce: (message: string) => void;
