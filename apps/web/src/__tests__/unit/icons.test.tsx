import { createTestRunner } from '@/utils/test-runner';
import { Icons } from '@/components/icons';
import * as IconsModule from '@/components/icons';
import * as IconsIndex from '@/components/icons/index';

const { describe, test, expect, run } = createTestRunner();

describe('Icons Component', () => {
  test('Icons object contains all the required icons', () => {
    // Test the main export
    expect(Icons).toBeDefined();

    // Test social icons
    expect(Icons?.google).toBeDefined();
    expect(Icons?.facebook).toBeDefined();
    expect(Icons?.apple).toBeDefined();

    // Test common UI icons
    expect(Icons?.logo).toBeDefined();
    expect(Icons?.spinner).toBeDefined();
    expect(Icons?.arrowRight).toBeDefined();
    expect(Icons?.chevronDown).toBeDefined();
    expect(Icons?.chevronUp).toBeDefined();

    // Test theme icons
    expect(Icons?.sun).toBeDefined();
    expect(Icons?.moon).toBeDefined();
    expect(Icons?.system).toBeDefined();

    // Test notification icons
    expect(Icons?.bell).toBeDefined();

    // Test user-related icons
    expect(Icons?.user).toBeDefined();
    expect(Icons?.settings).toBeDefined();

    // Test action icons
    expect(Icons?.close).toBeDefined();
    expect(Icons?.menu).toBeDefined();
  });

  test('Icons components are functions', () => {
    // Test icon components are functions
    expect(typeof Icons?.google).toBe('function');
    expect(typeof Icons?.facebook).toBe('function');
    expect(typeof Icons?.apple).toBe('function');
    expect(typeof Icons?.logo).toBe('function');
    expect(typeof Icons?.spinner).toBe('function');
  });

  test('Individual icon exports are defined', () => {
    // Test named exports
    expect(IconsModule?.Spinner).toBeDefined();
    expect(IconsModule?.Logo).toBeDefined();
    expect(IconsModule?.ChevronDown).toBeDefined();
    expect(IconsModule?.ChevronUp).toBeDefined();
    expect(IconsModule?.ArrowRight).toBeDefined();
    expect(IconsModule?.SunIcon).toBeDefined();
    expect(IconsModule?.MoonIcon).toBeDefined();
    expect(IconsModule?.SystemIcon).toBeDefined();
    expect(IconsModule?.BellIcon).toBeDefined();
    expect(IconsModule?.ChatIcon).toBeDefined();
    expect(IconsModule?.UserIcon).toBeDefined();
    expect(IconsModule?.SettingsIcon).toBeDefined();
    expect(IconsModule?.CloseIcon).toBeDefined();
    expect(IconsModule?.MenuIcon).toBeDefined();
  });

  test('Index exports are defined', () => {
    // Test index exports
    expect(IconsIndex?.Icons).toBeDefined();
    expect(IconsIndex?.Outline).toBeDefined();
    expect(IconsIndex?.Solid).toBeDefined();

    // Test some specific icon exports
    expect(IconsIndex?.google).toBeDefined();
    expect(IconsIndex?.facebook).toBeDefined();
    expect(IconsIndex?.spinner).toBeDefined();
    expect(IconsIndex?.logo).toBeDefined();
  });
});

// Run the tests if this file is executed directly
if (typeof require !== 'undefined' && require?.main === module) {
  run().catch(console?.error);
}
