import type { ReactNode } from 'react';
import { WellnessHeader } from '@/components/wellness/WellnessHeader';
import { BeautyWellnessNav } from '@/components/navigation/BeautyWellnessNav';

export default function BeautyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4">
      <WellnessHeader title="Beauty & Wellness" />
      <BeautyWellnessNav activeTab="beauty" />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}
