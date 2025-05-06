import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  const baseClasses = 'rounded-lg border bg-card shadow-sm';
  const classes = `${baseClasses} ${className || ''}`;

  return (
    <div className={classes} role="article" {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  className, 
  children,
  ...props 
}) => {
  const classes = `p-6 pb-2 pt-6 ${className || ''}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  className, 
  children,
  as: Component = 'h3',
  ...props 
}) => {
  const classes = `text-lg font-semibold ${className || ''}`;

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ 
  className, 
  children,
  ...props 
}) => {
  const classes = `text-sm text-muted-foreground ${className || ''}`;

  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  className, 
  children,
  ...props 
}) => {
  const classes = `p-6 pt-0 ${className || ''}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  className, 
  children,
  ...props 
}) => {
  const classes = `flex items-center p-6 pt-0 ${className || ''}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}; 