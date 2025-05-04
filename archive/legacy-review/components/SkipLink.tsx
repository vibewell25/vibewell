'use client';

import React from 'react';

interface SkipLinkProps {
  targetId?: string;
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  children = 'Skip to main content',
}) => {
  return (
    <a
      href={`#${targetId}`}
      className="focus:text-primary sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:font-medium focus:shadow-lg"
    >
      {children}
    </a>
  );
};

export default SkipLink;
