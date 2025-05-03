import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getShareData } from '@/lib/api/share';
import { ShareView } from '@/components/ar/share-view';

interface SharePageProps {
  params: {
    id: string;
  };
}

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const shareData = await getShareData(params?.id);

  if (!shareData) {
    return {
      title: 'Share Not Found',
      description: 'The requested share could not be found.',
    };
  }

  const title = `My ${shareData?.type} try-on look${shareData?.productName ? ` with ${shareData?.productName}` : ''}`;
  const description = `Check out my ${shareData?.type} try-on look using VibeWell!${shareData?.productName ? ` I'm trying on ${shareData?.productName}.` : ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: shareData?.imageData,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      url: `${process?.env.NEXT_PUBLIC_APP_URL}/share/${params?.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareData?.imageData],
    },
  };
}

export default async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); SharePage({ params }: SharePageProps) {
  const shareData = await getShareData(params?.id);

  if (!shareData) {
    notFound();
  }

  return <ShareView shareData={shareData} />;
}
