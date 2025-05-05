import AccessibilityControls from '@/components/accessibility/AccessibilityControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AccessibilitySettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Accessibility Settings</h1>

      <div className="mx-auto grid max-w-3xl gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Experience</CardTitle>
            <CardDescription>
              Adjust these settings to make VibeWell work better for your needs. Changes will be
              saved automatically and applied across all your devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccessibilityControls />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Accessibility at VibeWell</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert">
            <p>
              We're committed to making VibeWell accessible to everyone. These settings help
              customize the experience to your needs, but we're always looking to improve.
            </p>
            <p>
              If you encounter any accessibility issues or have suggestions for improvement, please
              contact us at{' '}
              <a
                href="mailto:accessibility@vibewell.com"
                className="text-primary font-medium underline underline-offset-4"
              >
                accessibility@vibewell.com
              </a>
              .
            </p>
            <h3 className="mt-4 text-lg font-semibold">Key Accessibility Features:</h3>
            <ul className="list-disc pl-6">
              <li>
                <strong>High Contrast:</strong> Enhances text contrast and makes UI elements more
                distinct.
              </li>
              <li>
                <strong>Large Text:</strong> Increases the font size throughout the application.
              </li>
              <li>
                <strong>Reduced Motion:</strong> Minimizes animations and transitions for users
                sensitive to motion.
              </li>
              <li>
                <strong>Keyboard Focus Indicators:</strong> Adds visible outlines around focused
                elements for keyboard users.
              </li>
              <li>
                <strong>Language Settings:</strong> Supports multiple languages, including
                right-to-left text direction.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
