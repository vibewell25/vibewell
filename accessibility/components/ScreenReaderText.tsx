import React from 'react';

interface ScreenReaderTextProps {
  children: React?.ReactNode;
  as?: keyof JSX?.IntrinsicElements;
}

export const ScreenReaderText: React?.FC<ScreenReaderTextProps> = ({ 
  children,
  as: Component = 'span'
}) => {
  return (
    <Component 
      className="sr-only" 
      aria-hidden="false"
    >
      {children}
    </Component>
  );
};

export default ScreenReaderText;
