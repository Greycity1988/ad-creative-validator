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
        // Northpoint Scandinavian Minimalist Palette
        canvas: {
          DEFAULT: '#F8F8F6',
          subtle: '#F2F2EF',
          muted: '#EAEAE6',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FFFFFF',
          sunken: '#F7F7F5',
        },
        ink: {
          primary: '#111215',
          secondary: '#4B4F58',
          tertiary: '#767C89',
          muted: '#9CA3AF',
          faint: '#D1D5DB',
        },
        line: {
          DEFAULT: '#E8E8E4',
          subtle: '#EEEEEC',
          strong: '#D5D5CE',
        },
        accent: {
          DEFAULT: '#143126', // Deep Scandinavian Forest Pine
          hover: '#1B3F32',
          light: '#EBF4F0',
          mint: '#10B981',
          neon: '#059669',
        },
        // Functional Status Colors (Refined Soft Tints)
        status: {
          pass: {
            bg: '#F0FDF4',
            border: '#BBF7D0',
            text: '#166534',
            dot: '#22C55E',
          },
          warn: {
            bg: '#FFFBEB',
            border: '#FDE68A',
            text: '#92400E',
            dot: '#F59E0B',
          },
          fail: {
            bg: '#FEF2F2',
            border: '#FECACA',
            text: '#991B1B',
            dot: '#EF4444',
          },
          skip: {
            bg: '#F3F4F6',
            border: '#E5E7EB',
            text: '#4B5563',
            dot: '#9CA3AF',
          },
        },
        primary: '#143126',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      boxShadow: {
        'soft-xs': '0 1px 2px rgba(0, 0, 0, 0.03)',
        'soft-sm': '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 12px 28px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)',
        'soft-xl': '0 20px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
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
