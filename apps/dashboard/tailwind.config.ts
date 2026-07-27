import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep slate — the "evidence record" ground tone.
        ink: {
          DEFAULT: '#0d1526',
          50: '#f4f6fb',
          100: '#e6eaf3',
          700: '#1c2740',
          800: '#141d31',
          900: '#0d1526',
          950: '#080e1c',
        },
        // Solar amber — energy / capture accent.
        solar: {
          DEFAULT: '#f5a524',
          50: '#fff8ec',
          100: '#ffedcc',
          200: '#ffd894',
          300: '#ffbe5c',
          400: '#fba82f',
          500: '#f5a524',
          600: '#d97e0a',
          700: '#b45c0c',
          800: '#924910',
          900: '#783c11',
        },
        // Verify green — PASS / gate credit.
        verify: {
          DEFAULT: '#16a34a',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,21,38,0.06), 0 8px 24px -12px rgba(13,21,38,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
