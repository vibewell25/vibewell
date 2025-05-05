import React, { useState, useRef, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
interface AccessibleTabsProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
export const AccessibleTabs: React.FC<AccessibleTabsProps> = ({
  tabs,
  defaultActiveTab,
  className = '',
  onTabChange,
) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0].id);
  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
[defaultActiveTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange.(tabId);
const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tabId);
else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (!nextTab.disabled) {
        handleTabClick(nextTab.id);
else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      const prevTab = tabs[prevIndex];
      if (!prevTab.disabled) {
        handleTabClick(prevTab.id);
else if (e.key === 'Home') {
      e.preventDefault();
      const firstTab = tabs.find((tab) => !tab.disabled);
      if (firstTab) {
        handleTabClick(firstTab.id);
else if (e.key === 'End') {
      e.preventDefault();
      const lastTab = [...tabs].reverse().find((tab) => !tab.disabled);
      if (lastTab) {
        handleTabClick(lastTab.id);
return (
    <div className={className}>
      <div
        role="tablist"
        ref={tabListRef}
        className="flex border-b border-gray-200"
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={tab.disabled}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-primary text-primary border-b-2'
                : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
${tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          className={`p-4 ${activeTab === tab.id ? '' : 'hidden'}`}
        >
          {tab.content}
        </div>
      ))}
    </div>
export default AccessibleTabs;
