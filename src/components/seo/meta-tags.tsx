import React from 'react';
import Head from 'next/head';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export default function MetaTags({
  title = 'Vibewell - Connect with wellness and beauty service providers',
  description = 'Find and book wellness and beauty services, connect with providers, and manage your appointments all in one place.',
  keywords = 'wellness, beauty, services, appointments, booking, health, self-care',
  ogImage = '/images/og-image.jpg',
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterSite = '@vibewell',
  canonicalUrl,
  noIndex = false,
}: MetaTagsProps) {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
