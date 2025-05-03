'use client';
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BreadcrumbExample } from '@/components/examples/BreadcrumbExample';
import { Button } from '@/components/ui/Button';
import { useState, Suspense } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { useSearchParams } from 'next/navigation';
function BreadcrumbDocumentationContent() {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = (code: string) => {
    navigator?.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // Code examples
  const basicUsageCode = `import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Icons } from '@/components/icons';
export function MyBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbItem isFirstItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/products">Products</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>
        <span className="text-sm font-medium">Product Details</span>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}`;
  const customStylingCode = `<Breadcrumb className="bg-muted p-2 rounded-md">
  <BreadcrumbItem isFirstItem>
    <BreadcrumbLink 
      href="/" 
      className="text-primary hover:text-primary/80 flex items-center"
    >
      <Icons?.HomeIcon className="h-4 w-4 mr-1" />
      Home
    </BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem isCurrentPage>
    <span className="text-sm font-semibold">Settings</span>
  </BreadcrumbItem>
</Breadcrumb>`;
  return (
    <Layout>
      <div className="container-app py-8">
        {/* Current page breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem isFirstItem>
            <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/developer/docs">Documentation</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/developer/docs/components">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <span className="text-sm font-medium">Breadcrumb</span>
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="mb-8 flex flex-col items-start justify-between md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Breadcrumb</h1>
            <p className="text-muted-foreground">
              A navigation component that helps users understand the hierarchy of a website.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <a
                href="https://github?.com/vibewell/components/blob/main/src/components/ui/breadcrumb?.tsx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icons?.CodeBracketIcon className="mr-2 h-4 w-4" />
                View Source
              </a>
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="mb-8 rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Preview</h2>
              <div className="rounded-md border bg-background p-4">
                <BreadcrumbExample />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-xl font-semibold">About</h2>
                <p className="text-muted-foreground">
                  Breadcrumbs are navigation aids that help users understand their current location
                  within a website's hierarchy. They provide a trail of links that show the path
                  from the homepage to the current page, helping users navigate back to previous
                  levels.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold">Features</h2>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Responsive and accessible breadcrumb navigation</li>
                  <li>Support for custom icons and styling</li>
                  <li>Proper ARIA attributes for improved accessibility</li>
                  <li>Optional current page indicator</li>
                  <li>Support for custom separators between items</li>
                </ul>
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold">Accessibility</h2>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>
                    Uses proper <code>nav</code> and <code>ol</code> elements for semantic structure
                  </li>
                  <li>
                    Includes <code>aria-label="Breadcrumb"</code> for screen readers
                  </li>
                  <li>
                    Uses <code>aria-current="page"</code> to indicate the current page
                  </li>
                  <li>Visible separators between breadcrumb items</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="usage">
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Basic Usage</h2>
                <div className="mb-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-sm font-medium">Example</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(basicUsageCode)}
                      className="h-8 gap-1"
                    >
                      {copied ? (
                        <>
                          <Icons?.ClipboardDocumentCheckIcon className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Icons?.ClipboardIcon className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="border-b bg-muted p-4">
                    <pre className="overflow-auto text-sm">{basicUsageCode}</pre>
                  </div>
                  <div className="bg-background p-4">
                    <Breadcrumb>
                      <BreadcrumbItem isFirstItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbItem isCurrentPage>
                        <span className="text-sm font-medium">Product Details</span>
                      </BreadcrumbItem>
                    </Breadcrumb>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  The example above shows a basic breadcrumb navigation with three levels. The{' '}
                  <code>isFirstItem</code> prop is used to indicate the first item, which prevents
                  the chevron separator from appearing before it. The <code>isCurrentPage</code>{' '}
                  prop is used to indicate the current page.
                </p>
              </div>
              <div>
                <h2 className="mb-4 text-xl font-semibold">Custom Styling</h2>
                <div className="mb-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-sm font-medium">Example</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(customStylingCode)}
                      className="h-8 gap-1"
                    >
                      {copied ? (
                        <>
                          <Icons?.ClipboardDocumentCheckIcon className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Icons?.ClipboardIcon className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="border-b bg-muted p-4">
                    <pre className="overflow-auto text-sm">{customStylingCode}</pre>
                  </div>
                  <div className="bg-background p-4">
                    <Breadcrumb className="rounded-md bg-muted p-2">
                      <BreadcrumbItem isFirstItem>
                        <BreadcrumbLink
                          href="/"
                          className="text-primary hover:text-primary/80 flex items-center"
                        >
                          <Icons?.HomeIcon className="mr-1 h-4 w-4" />
                          Home
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbItem isCurrentPage>
                        <span className="text-sm font-semibold">Settings</span>
                      </BreadcrumbItem>
                    </Breadcrumb>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  You can customize the appearance of breadcrumbs by adding className props. The
                  example above shows a breadcrumb with a background, custom text color, and an icon
                  for the home link.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="api">
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Components</h2>
                <p className="mb-6 text-muted-foreground">
                  The breadcrumb component consists of three main parts:
                </p>
                <div className="space-y-6">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-3 text-lg font-semibold">Breadcrumb</h3>
                    <p className="mb-4 text-muted-foreground">
                      The main container that wraps the breadcrumb navigation.
                    </p>
                    <h4 className="mb-2 text-sm font-semibold">Props</h4>
                    <div className="overflow-hidden rounded-md border">
                      <table className="min-w-full divide-y">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Prop
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Type
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Default
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-2 text-sm">className</td>
                            <td className="px-4 py-2 text-sm">string</td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">Additional CSS classes</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">children</td>
                            <td className="px-4 py-2 text-sm">ReactNode</td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">BreadcrumbItem components</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-3 text-lg font-semibold">BreadcrumbItem</h3>
                    <p className="mb-4 text-muted-foreground">
                      Represents a single item in the breadcrumb trail.
                    </p>
                    <h4 className="mb-2 text-sm font-semibold">Props</h4>
                    <div className="overflow-hidden rounded-md border">
                      <table className="min-w-full divide-y">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Prop
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Type
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Default
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-2 text-sm">className</td>
                            <td className="px-4 py-2 text-sm">string</td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">Additional CSS classes</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">children</td>
                            <td className="px-4 py-2 text-sm">ReactNode</td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">Content of the breadcrumb item</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">isCurrentPage</td>
                            <td className="px-4 py-2 text-sm">boolean</td>
                            <td className="px-4 py-2 text-sm">false</td>
                            <td className="px-4 py-2 text-sm">
                              Indicates if this item represents the current page
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">isFirstItem</td>
                            <td className="px-4 py-2 text-sm">boolean</td>
                            <td className="px-4 py-2 text-sm">false</td>
                            <td className="px-4 py-2 text-sm">
                              Indicates if this is the first item in the breadcrumb
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-3 text-lg font-semibold">BreadcrumbLink</h3>
                    <p className="mb-4 text-muted-foreground">
                      Represents a link within a breadcrumb item.
                    </p>
                    <h4 className="mb-2 text-sm font-semibold">Props</h4>
                    <div className="overflow-hidden rounded-md border">
                      <table className="min-w-full divide-y">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Prop
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Type
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Default
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-2 text-sm">className</td>
                            <td className="px-4 py-2 text-sm">string</td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">Additional CSS classes</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">href</td>
                            <td className="px-4 py-2 text-sm">string</td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">URL the link points to</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">children</td>
                            <td className="px-4 py-2 text-sm">ReactNode</td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">Content of the link</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">asChild</td>
                            <td className="px-4 py-2 text-sm">boolean</td>
                            <td className="px-4 py-2 text-sm">false</td>
                            <td className="px-4 py-2 text-sm">Allows custom link components</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
export default function BreadcrumbDocumentation() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <BreadcrumbDocumentationContent />
    </Suspense>
  );
}
