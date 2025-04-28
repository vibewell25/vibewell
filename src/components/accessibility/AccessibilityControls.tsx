'use client';;
import { useAccessibilityContext } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AccessibilityControls = () => {
  const {
    preferences,
    supportedLanguages,
    setHighContrast,
    setLargeText,
    setReduceMotion,
    setKeyboardFocusVisible,
    setLanguage,
    resetPreferences,
  } = useAccessibilityContext();

  return (
    <div className="space-y-6 rounded-lg bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Accessibility Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="high-contrast">High Contrast</Label>
          <Switch
            id="high-contrast"
            checked={preferences.highContrast}
            onCheckedChange={setHighContrast}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="large-text">Large Text</Label>
          <Switch id="large-text" checked={preferences.largeText} onCheckedChange={setLargeText} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="reduce-motion">Reduce Motion</Label>
          <Switch
            id="reduce-motion"
            checked={preferences.reduceMotion}
            onCheckedChange={setReduceMotion}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="keyboard-focus">Show Keyboard Focus</Label>
          <Switch
            id="keyboard-focus"
            checked={preferences.keyboardFocusVisible}
            onCheckedChange={setKeyboardFocusVisible}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language-select">Language</Label>
          <Select value={preferences.language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name} {lang.isRTL ? '(RTL)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4">
        <Button variant="outline" className="w-full" onClick={resetPreferences}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default AccessibilityControls;
