import * as React from 'react';

export interface BreadcrumbItemData {
  label: string;
  href: string;
  onClick?: () => void;
}

export interface AccessibleBreadcrumbProps {
  items: BreadcrumbItemData[];
  className?: string;
}

export function AccessibleBreadcrumb({ items, className }: AccessibleBreadcrumbProps) {
  // Generate a unique ID for aria-labelledby
  const labelId = React.useId
    ? React.useId()
    : `breadcrumb-label-${Math.random().toString(36).substr(2, 5)}`;

  // Warn if labels are too long
  React.useEffect(() => {
    items.forEach((item) => {
      if (item.label.length > 50) {
        console.warn(`Breadcrumb label exceeds recommended length: ${item.label}`);
      }
    });
  }, [items]);

  return (
    <nav role="navigation" aria-label="Breadcrumb" className={className}>
      <h2 id={labelId} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        Breadcrumb
      </h2>
      <ol role="list" aria-labelledby={labelId}>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <li role="listitem">
              <a
                href={
                  item.href.startsWith('javascript:') || item.href.startsWith('data:')
                    ? '#'
                    : item.href
                }
                onClick={item.onClick}
              >
                {item.label}
              </a>
            </li>
            {idx < items.length - 1 && (
              <span aria-hidden="true" style={{ margin: '0 8px' }}>
                /
              </span>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
