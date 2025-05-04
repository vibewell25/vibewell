interface FontDefinition {
  family: string;
  weight?: number | string;
  style?: 'normal' | 'italic';
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
  unicode?: string;
}

const FONT_DEFINITIONS: FontDefinition[] = [
  {
    family: 'Inter',
    weight: '400',
    style: 'normal',
    display: 'swap',
    preload: true,
    unicode:

















      'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  {
    family: 'Inter',
    weight: '500',
    style: 'normal',
    display: 'swap',
    preload: true,
  },
  {
    family: 'Inter',
    weight: '600',
    style: 'normal',
    display: 'swap',
    preload: false,
  },
  {
    family: 'Inter',
    weight: '700',
    style: 'normal',
    display: 'swap',
    preload: false,
  },
];

export function generateFontFaceCSS(): string {
  return FONT_DEFINITIONS.map(
    (font) => `

    @font-face {

      font-family: '${font.family}';

      font-style: ${font.style || 'normal'};

      font-weight: ${font.weight || '400'};

      font-display: ${font.display || 'swap'};
      src: url('/fonts/${font.family.toLowerCase()}-${font.weight}${font.style === 'italic' ? '-italic' : ''}.woff2') format('woff2'),
           url('/fonts/${font.family.toLowerCase()}-${font.weight}${font.style === 'italic' ? '-italic' : ''}.woff') format('woff');

      ${font.unicode ? `unicode-range: ${font.unicode};` : ''}
    }
  `,
  ).join('\n');
}

export function generatePreloadLinks(): string {
  return FONT_DEFINITIONS.filter((font) => font.preload)
    .map(
      (font) => `
      <link
        rel="preload"
        href="/fonts/${font.family.toLowerCase()}-${font.weight}${font.style === 'italic' ? '-italic' : ''}.woff2"
        as="font"

        type="font/woff2"
        crossorigin="anonymous"
      />
    `,
    )
    .join('\n');
}

export function loadFonts(): void {
  if ('fonts' in document) {
    FONT_DEFINITIONS.forEach(async (font) => {
      try {
        await (document as any).fonts.load(
          `${font.weight} ${font.style || 'normal'} ${font.family}`,
        );
      } catch (error) {
        console.warn(`Failed to load font: ${font.family} ${font.weight} ${font.style}`, error);
      }
    });
  }
}

export function generateFallbackCSS(): string {
  return `

    .font-sans {




      font-family: ${FONT_DEFINITIONS.map((f) => `'${f.family}'`).join(', ')}, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Font optimization classes */

    .optimize-legibility {

      text-rendering: optimizeLegibility;

      -webkit-font-smoothing: antialiased;


      -moz-osx-font-smoothing: grayscale;
    }
    

    /* Size-specific letter spacing */


    .text-xs, .text-sm {

      letter-spacing: 0.01em;
    }

    .text-base {

      letter-spacing: normal;
    }


    .text-lg, .text-xl {

      letter-spacing: -0.01em;
    }


    .text-2xl, .text-3xl {

      letter-spacing: -0.02em;
    }
  `;
}
