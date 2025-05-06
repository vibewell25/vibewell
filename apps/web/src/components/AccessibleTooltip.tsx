import React, { useState, useRef, useEffect } from 'react';

interface AccessibleTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
export const AccessibleTooltip: React.FC<AccessibleTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 0,
  className = '',
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
delay);
const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
setIsVisible(false);
useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
[]);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
const arrowStyles = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
    right: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
    left: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rotate-45',
return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={() => {
        setIsFocused(true);
        showTooltip();
onBlur={() => {
        setIsFocused(false);
        hideTooltip();
>
      {children}

      {(isVisible || isFocused) && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 rounded-md bg-gray-900 px-3 py-2 text-sm text-white ${positionStyles[position]} ${className} `}
        >
          <div className={`absolute h-2 w-2 bg-gray-900 ${arrowStyles[position]} `} />
          {content}
        </div>
      )}
    </div>
export default AccessibleTooltip;
