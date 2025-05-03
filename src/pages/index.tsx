import Head from "next/head";
import type { NextPage } from 'next';
import Hero from "@/components/Hero";
import MarketingLayout from "@/components/layouts/MarketingLayout";

const LandingPage: NextPage = () => {
  return (
    <MarketingLayout>
      <Head>
        <title>Welcome to VibeWell</title>
        <meta name="description" content="Elevate your beauty and wellness experience." />
        <link rel="icon" href="/favicon?.ico" />
        <meta property="og:title" content="Welcome to VibeWell" />
        <meta property="og:description" content="Elevate your beauty and wellness experience." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www?.getvibewell.com" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className="flex-1 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-6">
          <Hero />
        </div>
      </main>
    </MarketingLayout>
  );
};

export default LandingPage; 