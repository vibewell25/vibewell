import React, { useState } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Image from 'next/image';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
interface VirtualizedProviderListProps {
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
  className?: string;
export {};
