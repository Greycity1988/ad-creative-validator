/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // Theme-aware palette: values live in src/index.css (html.dark / html.light)
        canvas: {
          DEFAULT: 'rgb(var(--c-canvas) / <alpha-value>)',
          subtle: 'rgb(var(--c-canvas-subtle) / <alpha-value>)',
          muted: 'rgb(var(--c-canvas-muted) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--c-surface) / <alpha-value>)',
          raised: 'rgb(var(--c-surface-raised) / <alpha-value>)',
          sunken: 'rgb(var(--c-surface-sunken) / <alpha-value>)',
          glass: 'var(--c-surface-glass)',
          sage: 'rgb(var(--c-surface-sage) / <alpha-value>)',
        },
        ink: {
          primary: 'rgb(var(--c-ink-primary) / <alpha-value>)',
          secondary: 'rgb(var(--c-ink-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--c-ink-tertiary) / <alpha-value>)',
          muted: 'rgb(var(--c-ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--c-ink-faint) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
          subtle: 'rgb(var(--c-line-subtle) / <alpha-value>)',
          strong: 'rgb(var(--c-line-strong) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          hover: 'rgb(var(--c-accent-hover) / <alpha-value>)',
          violet: 'rgb(var(--c-accent) / <alpha-value>)',
          indigo: 'rgb(var(--c-accent) / <alpha-value>)',
          blue: 'rgb(var(--c-accent-blue) / <alpha-value>)',
          sky: 'rgb(var(--c-accent-blue) / <alpha-value>)',
          sage: 'rgb(var(--c-accent-sage) / <alpha-value>)',
          mint: 'rgb(var(--c-accent-mint) / <alpha-value>)',
          light: 'rgb(var(--c-accent-light) / <alpha-value>)',
        },
        status: {
          pass: {
            bg: 'rgb(var(--c-status-pass-bg) / <alpha-value>)',
            border: 'rgb(var(--c-status-pass-border) / <alpha-value>)',
            text: 'rgb(var(--c-status-pass-text) / <alpha-value>)',
            dot: 'rgb(var(--c-status-pass-dot) / <alpha-value>)',
          },
          warn: {
            bg: 'rgb(var(--c-status-warn-bg) / <alpha-value>)',
            border: 'rgb(var(--c-status-warn-border) / <alpha-value>)',
            text: 'rgb(var(--c-status-warn-text) / <alpha-value>)',
            dot: 'rgb(var(--c-status-warn-dot) / <alpha-value>)',
          },
          fail: {
            DEFAULT: 'rgb(var(--c-status-fail) / <alpha-value>)',
            bg: 'rgb(var(--c-status-fail-bg) / <alpha-value>)',
            border: 'rgb(var(--c-status-fail-border) / <alpha-value>)',
            text: 'rgb(var(--c-status-fail-text) / <alpha-value>)',
            dot: 'rgb(var(--c-status-fail-dot) / <alpha-value>)',
          },
          skip: {
            bg: 'rgb(var(--c-status-skip-bg) / <alpha-value>)',
            border: 'rgb(var(--c-status-skip-border) / <alpha-value>)',
            text: 'rgb(var(--c-status-skip-text) / <alpha-value>)',
            dot: 'rgb(var(--c-status-skip-dot) / <alpha-value>)',
          },
        },
        // Monotone Suite Tokens
        mono: {
          black: '#000000',
          card: '#141416',
          cardHover: '#1c1d20',
          cardInner: '#1e1f23',
          cardBorder: '#26272c',
          pill: '#202126',
          pillHover: '#2e2f36',
          dim: '#6E6E6E',
          nickel: '#6B7271',
          sub: '#AEAEAE',
          silver: '#99A3A2',
          white: '#FFFFFF',
        },
        signal: {
          DEFAULT: '#A8FF1A',
          dark: '#0c2205',
          border: '#A8FF1A',
        },
        warning: {
          DEFAULT: '#F34238',
          dark: '#2a0a08',
          border: '#F34238',
        },
        studio: {
          bg: '#99A3A2',
          bgDark: '#8A9190',
          canvasDark: '#010101',
        },
        primary: '#A8FF1A',
        success: '#A8FF1A',
        error: '#F34238',
      },
      boxShadow: {
        'soft-xs': '0 1px 3px rgba(var(--shadow-a), calc(0.4 * var(--shadow-k)))',
        'soft-sm': '0 4px 14px rgba(var(--shadow-a), calc(0.5 * var(--shadow-k)))',
        'soft-md': '0 8px 26px rgba(var(--shadow-a), calc(0.6 * var(--shadow-k)))',
        'soft-lg': '0 16px 36px rgba(var(--shadow-a), calc(0.7 * var(--shadow-k)))',
        'soft-xl': '0 24px 50px rgba(var(--shadow-a), calc(0.8 * var(--shadow-k)))',
        'lifemed': '0 8px 30px rgba(var(--shadow-a), calc(0.5 * var(--shadow-k)))',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
