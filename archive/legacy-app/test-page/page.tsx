export default function TestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-6 text-4xl font-bold">Test Page</h1>
      <p className="mb-8 text-xl">This is a test page to verify Link components work properly</p>
      
      <div className="flex space-x-4">
        <a href="/" className="rounded-md bg-primary-600 px-6 py-2 text-white hover:bg-primary-700">
          Home (HTML Link)
        </a>
        <a href="/services" className="rounded-md border border-primary-600 px-6 py-2 text-primary-600 hover:bg-gray-50">
          Services (HTML Link)
        </a>
      </div>
    </div>
