import React from 'react';

interface SkipLinkProps {
  targetId: string;
  label?: string;
export const SkipLink: React.FC<SkipLinkProps> = ({ 
  targetId, 
  label = "Skip to main content" 
) => {
  return (
    <a 
      href={`#${targetId}`} 
      className="skip-link"
    >
      {label}
    </a>
export default SkipLink;
