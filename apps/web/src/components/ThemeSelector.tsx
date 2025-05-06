import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
from '@/components/ui/DropdownMenu';
import { Icons } from '@/components/icons';

interface ThemeSelectorProps {
  variant?: 'default' | 'mobile';
  showColorThemes?: boolean;
export function ThemeSelector({
  variant = 'default',
  showColorThemes = false,
: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  // Additional color themes beyond just light/dark
  const colorThemes = [
    { name: 'Default', value: 'default-theme', color: '#7C3AED' },
    { name: 'Green', value: 'green-theme', color: '#3A6351' },
    { name: 'Peach', value: 'peach-theme', color: '#FF9580' },
    { name: 'Blue', value: 'blue-theme', color: '#3B82F6' },
    { name: 'Purple', value: 'purple-theme', color: '#8B5CF6' },
  ];

  const setColorTheme = (theme: string) => {
    const root = window.document.documentElement;
    colorThemes.forEach((ct) => {
      root.classList.remove(ct.value);
root.classList.add(theme);
    // Store the color theme preference
    localStorage.setItem('vibewell-color-theme', theme);
// On component mount, restore any previously selected color theme
  if (typeof window !== 'undefined') {
    const storedColorTheme = localStorage.getItem('vibewell-color-theme');
    if (storedColorTheme) {
      setColorTheme(storedColorTheme);
if (variant === 'mobile') {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Display Mode</h3>
          <div className="flex space-x-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTheme('light')}
              aria-label="Light mode"
            >
              <Icons.SunIcon className="h-5 w-5" />
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTheme('dark')}
              aria-label="Dark mode"
            >
              <Icons.MoonIcon className="h-5 w-5" />
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTheme('system')}
              aria-label="System preference"
            >
              <Icons.ComputerDesktopIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {showColorThemes && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Color Theme</h3>
            <div className="flex flex-wrap gap-2">
              {colorThemes.map((colorTheme) => (
                <button
                  key={colorTheme.value}
                  className="focus:ring-primary h-8 w-8 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:border-gray-700"
                  style={{ backgroundColor: colorTheme.color }}
                  onClick={() => setColorTheme(colorTheme.value)}
                  aria-label={`Select ${colorTheme.name} theme`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icons.SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Icons.MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Icons.SunIcon className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Icons.MoonIcon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Icons.ComputerDesktopIcon className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>

        {showColorThemes && (
          <>
            <DropdownMenuItem className="mt-1 border-t pt-1">
              <Icons.PaintBrushIcon className="mr-2 h-4 w-4" />
              <span>Color Themes</span>
            </DropdownMenuItem>
            {colorThemes.map((colorTheme) => (
              <DropdownMenuItem
                key={colorTheme.value}
                onClick={() => setColorTheme(colorTheme.value)}
              >
                <div
                  className="mr-2 h-4 w-4 rounded-full"
                  style={{ backgroundColor: colorTheme.color }}
                />
                <span>{colorTheme.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
