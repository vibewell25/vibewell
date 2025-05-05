import React from 'react';

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
const DashboardHeader = ({ heading, text, children }: DashboardHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col gap-4 p-6 pb-0 md:flex-row md:items-center md:justify-between">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
export default DashboardHeader;
