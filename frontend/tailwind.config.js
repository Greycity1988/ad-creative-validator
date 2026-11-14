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
          'Plus Jakarta Sans',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // Lifemed Ultra-Clean Prismatic Palette
        canvas: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
          muted: '#F1F5F9',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FFFFFF',
          sunken: '#F8FAFC',
          glass: 'rgba(255, 255, 255, 0.82)',
        },
        ink: {
          primary: '#0A0A0A',
          secondary: '#52525B',
          tertiary: '#71717A',
          muted: '#A1A1AA',
          faint: '#E4E4E7',
        },
        line: {
          DEFAULT: 'rgba(0, 0, 0, 0.06)',
          subtle: 'rgba(0, 0, 0, 0.04)',
          strong: 'rgba(0, 0, 0, 0.12)',
        },
        accent: {
          DEFAULT: '#0A0A0A', // Lifemed Jet Black
          hover: '#262626',
          light: '#F4F4F5',
          mint: '#10B981',
          neon: '#059669',
        },
        // Functional Status Colors (Refined Lifemed Soft Tints)
        status: {
          pass: {
            bg: '#F0FDF4',
            border: 'rgba(34, 197, 94, 0.25)',
            text: '#166534',
            dot: '#22C55E',
          },
          warn: {
            bg: '#FFFBEB',
            border: 'rgba(245, 158, 11, 0.25)',
            text: '#92400E',
            dot: '#F59E0B',
          },
          fail: {
            bg: '#FEF2F2',
            border: 'rgba(239, 68, 68, 0.25)',
            text: '#991B1B',
            dot: '#EF4444',
          },
          skip: {
            bg: '#F8FAFC',
            border: 'rgba(0, 0, 0, 0.08)',
            text: '#475569',
            dot: '#94A3B8',
          },
        },
        primary: '#0A0A0A',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      boxShadow: {
        'soft-xs': '0 1px 2px rgba(0, 0, 0, 0.02)',
        'soft-sm': '0 4px 14px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 8px 26px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 16px 36px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'soft-xl': '0 24px 50px rgba(0, 0, 0, 0.06), 0 6px 18px rgba(0, 0, 0, 0.03)',
        'lifemed': '0 8px 30px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
