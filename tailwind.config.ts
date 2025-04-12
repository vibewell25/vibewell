import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      backgroundColor: {
        background: 'var(--background)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        card: 'var(--card)',
      },
      textColor: {
        foreground: 'var(--foreground)',
        'muted-foreground': 'var(--muted-foreground)',
        'primary-foreground': 'var(--primary-foreground)',
        'secondary-foreground': 'var(--secondary-foreground)',
        'accent-foreground': 'var(--accent-foreground)',
        'card-foreground': 'var(--card-foreground)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        border: 'var(--border)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config; 