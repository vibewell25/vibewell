import Head from "next/head";
import type { NextPage } from 'next';
import MarketingLayout from "@/components/layouts/MarketingLayout";

const AboutPage: NextPage = () => {
  return (
    <MarketingLayout>
      <Head>
        <title>About VibeWell</title>
        <meta name="description" content="Learn about VibeWell's mission, values, and community." />
        <meta property="og:title" content="About VibeWell" />
        <meta property="og:description" content="Learn about VibeWell's mission, values, and community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.getvibewell.com/about" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">About VibeWell</h1>
            <div className="space-y-6">
              <p className="text-lg text-gray-600 text-center">
                VibeWell is a platform dedicated to helping people discover and experience beauty and wellness in a personalized and empowering way.
                We connect clients with skilled professionals, offer cutting-edge virtual try-ons, skin analysis, and foster a supportive community focused on well-being.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Mission</h2>
                  <p className="text-gray-600">To make beauty and wellness services accessible, personalized, and empowering for everyone.</p>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Vision</h2>
                  <p className="text-gray-600">A world where everyone can easily access and experience transformative beauty and wellness services.</p>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Values</h2>
                  <p className="text-gray-600">Innovation, inclusivity, authenticity, and commitment to our community's well-being.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MarketingLayout>
export default AboutPage; 