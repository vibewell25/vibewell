import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { VirtualTryOn, ARFeatures } from '@/utils/dynamicImports';

interface SpecializedFeaturesProps {
  userId: string;
  productId?: string;
}

export const SpecializedFeatures: React.FC<SpecializedFeaturesProps> = ({
  userId,
  productId
}) => {
  return (
    <div className="specialized-features">
      <div className="features-grid">
        {/* Virtual Try-On Feature */}
        <div className="feature-card">
          <h3>Virtual Try-On</h3>
          <Suspense fallback={<LoadingSpinner />}>
            <VirtualTryOn userId={userId} productId={productId} />
          </Suspense>
        </div>

        {/* AR Features */}
        <div className="feature-card">
          <h3>AR Experience</h3>
          <Suspense fallback={<LoadingSpinner />}>
            <ARFeatures userId={userId} productId={productId} />
          </Suspense>
        </div>
      </div>

      <style jsx>{`
        .specialized-features {
          padding: 1rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .feature-card {
          background: var(--background-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h3 {
          margin: 0 0 1rem;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}; 