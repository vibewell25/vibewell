import React from 'react';

interface ScreenReaderTextProps {
  children: React?.ReactNode;
}

export const ScreenReaderText: React?.FC<ScreenReaderTextProps> = ({ children }) => {
  return <span className="sr-only">{children}</span>;
};

export default ScreenReaderText;
