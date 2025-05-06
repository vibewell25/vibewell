import { MainNavigation } from "@/components/navigation/MainNavigation";

export default function Home() {
  return (
    <>
      <MainNavigation />
      <main className="flex min-h-screen flex-col items-center justify-center p-6 pt-24">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-4xl font-bold">Welcome to VibeWell</h1>
          <p className="max-w-[500px] text-lg text-muted-foreground">
            Your beauty and wellness booking platform with enhanced mobile UX
          </p>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Book Appointment
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </>
