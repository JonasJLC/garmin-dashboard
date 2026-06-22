import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Hanken Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        background: '#121212',
        surface: '#131313',
        'surface-dim': '#131313',
        'surface-bright': '#393939',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1a1919',
        'surface-container': '#1a1a1a',
        'surface-container-high': '#242424',
        'surface-container-highest': '#353534',
        'on-background': '#e5e2e1',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#e2bfb0',
        primary: {
          DEFAULT: '#ffb693',
          foreground: '#541900',
        },
        'primary-container': '#ff6b00',
        'primary-fixed': '#ffdbcc',
        'on-primary': '#541900',
        'on-primary-container': '#000000',
        secondary: '#3fe87e',
        'secondary-container': '#00cb65',
        'secondary-fixed': '#63ff94',
        'on-secondary': '#003919',
        tertiary: '#adc6ff',
        'tertiary-container': '#5d97ff',
        'tertiary-fixed': '#d8e2ff',
        error: '#ffb4ab',
        'error-container': '#93000a',
        outline: '#2D2D2D',
        'outline-variant': '#5a4136',
        border: '#2D2D2D',
        input: '#2D2D2D',
        ring: '#ffb693',
        foreground: '#e5e2e1',
        'muted-foreground': '#e2bfb0',
        card: {
          DEFAULT: '#1a1a1a',
          foreground: '#e5e2e1',
        },
        popover: {
          DEFAULT: '#1a1a1a',
          foreground: '#e5e2e1',
        },
        muted: {
          DEFAULT: '#242424',
          foreground: '#e2bfb0',
        },
        accent: {
          DEFAULT: '#242424',
          foreground: '#e5e2e1',
        },
        success: {
          DEFAULT: '#3fe87e',
          foreground: '#003919',
        },
        destructive: {
          DEFAULT: '#ffb4ab',
          foreground: '#93000a',
        },
        chart: {
          1: '#3fe87e',
          2: '#ffb4ab',
          3: '#adc6ff',
          4: '#ffb693',
          5: '#5d97ff',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        gutter: '16px',
        'margin-desktop': '32px',
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.125rem',
        md: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.text-display-metrics': {
          fontSize: '48px',
          lineHeight: '56px',
          fontWeight: '700',
          letterSpacing: '0',
        },
        '.text-headline-lg': {
          fontSize: '32px',
          lineHeight: '40px',
          fontWeight: '600',
          letterSpacing: '0',
        },
        '.text-headline-md': {
          fontSize: '20px',
          lineHeight: '28px',
          fontWeight: '600',
          letterSpacing: '0',
        },
        '.text-label-caps': {
          fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: '500',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        },
        '.text-data-mono': {
          fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: '400',
          letterSpacing: '0',
        },
      })
    }),
  ],
} satisfies Config
