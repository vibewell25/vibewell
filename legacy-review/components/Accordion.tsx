import { Icons } from '@/components/icons';
import React, { useState } from 'react';
interface AccordionItem {
  id: string;
  title: string;
  content: React?.ReactNode;
}
interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}
export {};
