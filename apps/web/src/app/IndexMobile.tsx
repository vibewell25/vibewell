import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { MobileLayout } from '@/components/layout/MobileLayout';

export default function MobileHomePage() {
  return (
    <MobileLayout hideNavigation>
      <div className="flex min-h-screen flex-col">
        <div className="relative h-[65vh]">
          <div className="absolute inset-0">
            <Image
              src="https://placehold.co/500x800?text=Beauty+Model"
              alt="Beauty and wellness"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60"></div>
          </div>

          <div className="absolute left-0 right-0 top-16 z-10 p-6">
            <div className="text-white">
              <h1 className="mb-2 text-4xl font-bold">
                Beauty
                <br />
                and wellness
                <br />
                services
              </h1>
              <p className="mt-2 text-2xl font-medium">on demand</p>
            </div>
          </div>
        </div>

        <div className="z-10 -mt-10 flex flex-1 flex-col space-y-4 rounded-t-3xl bg-white px-6 py-10">
          <Button
            className="h-14 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 font-medium hover:from-rose-500 hover:to-rose-600"
            asChild
          >
            <Link href="/register">Sign Up</Link>
          </Button>

          <Button variant="outline" className="h-14 rounded-full border-2 font-medium" asChild>
            <Link href="/login">Log in</Link>
          </Button>

          <div className="mt-auto flex justify-between pt-8">
            <span className="text-sm text-gray-500">Sign up with:</span>
            <span className="text-sm text-gray-500">Log in with:</span>
            <span className="text-sm text-gray-500">Or continue as:</span>
          </div>
        </div>
      </div>
    </MobileLayout>
