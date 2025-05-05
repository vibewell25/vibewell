import { useRef, useState, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Image from 'next/image';
import { TryOnProduct } from '../../../utils/beauty-state';

interface VirtualizedProductGridProps {
  products: TryOnProduct[];
  isLoading: boolean;
  onSelectProduct: (product: TryOnProduct) => void;
  selectedProductId: string | null;
  gridClassName?: string;
/**
 * Virtualized product grid component using react-window for performance
 * This significantly improves performance when rendering large product catalogs
 */
export default function VirtualizedProductGrid({
  products,
  isLoading,
  onSelectProduct,
  selectedProductId,
  gridClassName = '',
: VirtualizedProductGridProps) {
  const [columnCount, setColumnCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Adjust column count based on container width
  useEffect(() => {
    if (!containerRef.current) return;

    const updateColumnCount = () => {
      const width = containerRef.current.clientWidth || 0;
      if (width < 640) {
        setColumnCount(2);
else if (width < 1024) {
        setColumnCount(3);
else {
        setColumnCount(4);
updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
[]);

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-pink-500"></div>
      </div>
if (products.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-500">No products found</p>
      </div>
// Calculate row count based on products length and column count
  const rowCount = Math.ceil(products.length / columnCount);

  // Cell renderer for the grid
  const ProductCell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= products.length) return null;

    const product = products[index];
    const isSelected = product.id === selectedProductId;
    const imageUrl = product.images[0].url || '/placeholder-product.jpg';

    return (
      <div
        style={style}
        className={`p-2 ${isSelected ? 'scale-105 opacity-100' : 'opacity-90 hover:opacity-100'} transition-all duration-200`}
      >
        <div
          className={`cursor-pointer overflow-hidden rounded-lg border ${
            isSelected
              ? 'border-pink-500 ring-2 ring-pink-300'
              : 'border-gray-200 hover:border-gray-300'
`}
          onClick={() => onSelectProduct(product)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectProduct(product);
tabIndex={0}
          role="button"
          aria-label={`Select ${product.name}`}
          aria-selected={isSelected}
        >
          <div className="relative aspect-square">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI2F3h7xgAAAABJRU5ErkJggg=="
            />
            {product.isNew && (
              <div className="absolute right-2 top-2 rounded-full bg-pink-500 px-2 py-1 text-xs text-white">
                New
              </div>
            )}
            {product.isBestSeller && (
              <div className="absolute left-2 top-2 rounded-full bg-yellow-500 px-2 py-1 text-xs text-white">
                Best Seller
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
            <p className="line-clamp-1 text-xs text-gray-500">{product.brand}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </span>
              <div className="flex items-center">
                <span className="mr-1 text-xs text-yellow-500">★</span>
                <span className="text-xs text-gray-500">{product.ratingAverage}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
return (
    <div ref={containerRef} className={`h-96 w-full ${gridClassName}`}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeGrid
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            columnCount={columnCount}
            columnWidth={width / columnCount}
            height={height}
            rowCount={rowCount}
            rowHeight={320} // Fixed height for each product card
            width={width}
          >
            {ProductCell}
          </FixedSizeGrid>
        )}
      </AutoSizer>
    </div>
