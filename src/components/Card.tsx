import React, { MouseEvent } from 'react';
import clsx from 'clsx';

type BaseCardProps = {
  variant?: 'elevated' | 'outlined' | 'flat';
  clickable?: boolean;
  loading?: boolean;
  responsive?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: (event: MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
};

export type CardProps = BaseCardProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof BaseCardProps>;

interface CardSubComponents {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Image: typeof CardImage;
}

export const Card: React.FC<CardProps> & CardSubComponents = ({
  variant = 'elevated',
  clickable = false,
  loading = false,
  responsive = false,
  className,
  children,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-labelledby': ariaLabelledby,
  ...props
}) => {
  const cardClasses = clsx(
    'card',
    `card-${variant}`,
    {
      'card-clickable': clickable,
      'card-loading': loading,
      'card-responsive': responsive,
    },
    className,
  );

  const commonProps = {
    className: cardClasses,
    'aria-busy': loading,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-labelledby': ariaLabelledby,
  };

  if (clickable) {
    const buttonProps = {
      type: 'button' as const,
      onClick: onClick as React.MouseEventHandler<HTMLButtonElement>,
      tabIndex: 0,
      role: 'button' as const,
      'data-testid': 'card',
      ...commonProps,
    };

    return (
      <button {...buttonProps}>
        {loading ? (
          <div data-testid="card-skeleton" className="card-skeleton" aria-hidden="true">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : (
          children
        )}
      </button>
    );
  }

  return (
    <div data-testid="card" onClick={onClick} {...commonProps} {...props}>
      {loading ? (
        <div data-testid="card-skeleton" className="card-skeleton" aria-hidden="true">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={clsx('card-header', className)} role="heading" {...props}>
    {children}
  </div>
);

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const CardBody: React.FC<CardBodyProps> = ({ className, children, ...props }) => (
  <div className={clsx('card-body', className)} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => (
  <div className={clsx('card-footer', className)} {...props}>
    {children}
  </div>
);

interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  alt?: string;
}

const CardImage: React.FC<CardImageProps> = ({ className, alt, ...props }) => {
  if (!alt) {
    console.warn('CardImage: Image is missing alt text. This is required for accessibility.');
  }

  return <img className={clsx('card-image', className)} alt={alt} {...props} />;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Image = CardImage;
