/** @type {import('tailwindcss').Config} */
export default {
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
        // Monotone Dark Studio Palette
        canvas: {
          DEFAULT: '#010101',
          subtle: '#141416',
          muted: '#1a1b1f',
        },
        surface: {
          DEFAULT: '#141416',
          raised: '#1a1b1f',
          sunken: '#0d0e10',
          glass: 'rgba(20, 20, 22, 0.95)',
          sage: '#1a1b1f',
        },
        ink: {
          primary: '#FFFFFF',
          secondary: '#AEAEAE',
          tertiary: '#8E8E93',
          muted: '#6E6E6E',
          faint: '#26272c',
        },
        line: {
          DEFAULT: '#26272c',
          subtle: '#202126',
          strong: '#2e3036',
        },
        accent: {
          DEFAULT: '#A8FF1A', // Runway Signal
          hover: '#b8ff33',
          violet: '#A8FF1A',
          indigo: '#A8FF1A',
          blue: '#38BDF8',
          sky: '#38BDF8',
          sage: '#202126',
          mint: '#A8FF1A',
          light: '#1a1b1f',
        },
        // Functional Status Colors in Dark Monotone
        status: {
          pass: {
            bg: '#0d2208',
            border: '#1f4812',
            text: '#A8FF1A',
            dot: '#A8FF1A',
          },
          warn: {
            bg: '#251b05',
            border: '#4a370a',
            text: '#FBBF24',
            dot: '#FBBF24',
          },
          fail: {
            bg: '#250c0b',
            border: '#4f1a18',
            text: '#F34238',
            dot: '#F34238',
          },
          skip: {
            bg: '#1a1b1f',
            border: '#26272c',
            text: '#AEAEAE',
            dot: '#6E6E6E',
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
        'soft-xs': '0 1px 3px rgba(0, 0, 0, 0.4)',
        'soft-sm': '0 4px 14px rgba(0, 0, 0, 0.5)',
        'soft-md': '0 8px 26px rgba(0, 0, 0, 0.6)',
        'soft-lg': '0 16px 36px rgba(0, 0, 0, 0.7)',
        'soft-xl': '0 24px 50px rgba(0, 0, 0, 0.8)',
        'lifemed': '0 8px 30px rgba(0, 0, 0, 0.5)',
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
