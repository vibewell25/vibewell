import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isCurrentPage?: boolean;
  children: React.ReactNode;
  isFirstItem?: boolean;
}

export interface BreadcrumbLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return (
    <nav 
      className={cn("flex", className)} 
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {props.children}
      </ol>
    </nav>
  );
}

export function BreadcrumbItem({ 
  className, 
  isCurrentPage,
  isFirstItem = false,
  children,
  ...props 
}: BreadcrumbItemProps) {
  return (
    <li 
      className={cn("inline-flex items-center", className)} 
      aria-current={isCurrentPage ? "page" : undefined}
      {...props}
    >
      <div className="flex items-center">
        {!isFirstItem && (
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground mx-1" />
        )}
        {children}
      </div>
    </li>
  );
}

export function BreadcrumbLink({ 
  className, 
  href,
  asChild = false,
  children,
  ...props 
}: BreadcrumbLinkProps) {
  const Comp = asChild ? React.Fragment : Link;
  
  return (
    <Comp
      className={cn(
        "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      href={href}
      {...props}
    >
      {children}
    </Comp>
  );
} 