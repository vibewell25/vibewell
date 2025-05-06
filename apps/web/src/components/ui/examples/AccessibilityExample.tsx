import React, { useState } from 'react';
import {
  AccessibleDialog,
  AccessibleIcon,
  FormErrorMessage,
  ScreenReaderOnly,
  SkipLink,
  VisuallyHidden,
from '../accessibility';
import { Bell, Info, HelpCircle } from 'lucide-react';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../card';

export function AccessibilityExample() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Name is required');
      return;
// Clear error and announce success to screen readers
    setNameError('');

    // Use the global announcer to inform screen readers
    if (window.announcer) {
      window.announcer.announce(`Form submitted successfully for ${name}`);
return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Accessibility Components Demo</CardTitle>
        <CardDescription>
          Examples of all accessibility components provided by the UI library
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SkipLink example - Only visible when tabbing */}
        <div className="relative rounded-md border p-4">
          <h3 className="mb-2 font-medium">SkipLink</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            This component is only visible when tabbed to. Try pressing Tab key.
          </p>
          <SkipLink targetId="main-content" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Tab to me first
            </Button>
            <Button variant="outline" size="sm">
              Then to me
            </Button>
          </div>
        </div>

        {/* ScreenReaderOnly example */}
        <div className="rounded-md border p-4">
          <h3 className="mb-2 font-medium">ScreenReaderOnly</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            This content is only visible to screen readers, not to sighted users.
          </p>
          <div className="flex items-center gap-2">
            <span>Visible text</span>
            <ScreenReaderOnly>
              This additional context is only announced to screen readers
            </ScreenReaderOnly>
          </div>
        </div>

        {/* VisuallyHidden example */}
        <div className="rounded-md border p-4">
          <h3 className="mb-2 font-medium">VisuallyHidden</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Similar to ScreenReaderOnly but with a different implementation.
          </p>
          <div className="flex items-center gap-2">
            <span>Visible text</span>
            <VisuallyHidden>
              This is also only for screen readers but uses a different CSS technique
            </VisuallyHidden>
          </div>
        </div>

        {/* AccessibleIcon example */}
        <div className="rounded-md border p-4">
          <h3 className="mb-2 font-medium">AccessibleIcon</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Makes icons accessible to screen readers.
          </p>
          <div className="flex items-center gap-4">
            <AccessibleIcon icon={<Bell className="h-5 w-5" />} label="Notifications" />

            <AccessibleIcon
              icon={<Info className="h-5 w-5" />}
              label="Information"
              labelPosition="after"
            />

            <AccessibleIcon
              icon={<HelpCircle className="h-5 w-5" />}
              label="Help"
              labelPosition="before"
            />
          </div>
        </div>

        {/* FormErrorMessage example */}
        <div className="rounded-md border p-4">
          <h3 className="mb-2 font-medium">FormErrorMessage</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Properly associates error messages with form fields.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-describedby={nameError ? 'name-error' : undefined}
                aria-invalid={Boolean(nameError)}
              />
              {nameError && <FormErrorMessage id="name-error">{nameError}</FormErrorMessage>}
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </div>

        {/* AccessibleDialog example */}
        <div className="rounded-md border p-4">
          <h3 className="mb-2 font-medium">AccessibleDialog & LiveAnnouncer</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Dialog with proper focus management and announcements.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>Open Dialog</Button>

          <AccessibleDialog
            title="Accessible Dialog Example"
            description="This dialog traps focus and returns it when closed"
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            footer={<Button onClick={() => setIsDialogOpen(false)}>Close</Button>}
          >
            <p>This dialog follows accessibility best practices:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Focus is trapped inside the dialog</li>
              <li>Focus returns to the trigger when closed</li>
              <li>ESC key closes the dialog</li>
              <li>Proper ARIA labeling</li>
            </ul>
          </AccessibleDialog>
        </div>
      </CardContent>

      <CardFooter className="border-t px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Note: The LiveAnnouncer component doesn't have a visual representation, but it's used by
          the form submission.
        </p>
      </CardFooter>
    </Card>
