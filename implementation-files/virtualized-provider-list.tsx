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
export const VirtualizedProviderList: React.FC<VirtualizedProviderListProps> = ({
  providers,
  onSelectProvider,
  className = '',
) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectProvider = (provider: Provider) => {
    setSelectedId(provider.id);
    onSelectProvider(provider);
const ProviderRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const provider = providers[index];
    const isSelected = selectedId === provider.id;
    
    return (
      <div 
        style={style}
        className={`p-4 border-b ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
        onClick={() => handleSelectProvider(provider)}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        data-testid="provider-row"
      >
        <div className="flex items-center">
          <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
            <Image 
              src={provider.imageUrl} 
              alt={provider.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium">{provider.name}</h3>
            <p className="text-sm text-gray-500">{provider.specialty}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-sm font-medium">{provider.rating}</span>
              <span className="text-xs text-gray-500 ml-1">({provider.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>
return (
    <div className={`h-96 ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={providers.length}
            itemSize={72}
            overscanCount={5}
          >
            {ProviderRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
