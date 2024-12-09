/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#030711',
        foreground: '#FAFAFA',
        primary: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
          hover: '#2563EB',
        },
        card: {
          DEFAULT: '#0F172A',
          foreground: '#FAFAFA',
          hover: '#1E293B',
        },
        border: '#1E293B',
        input: '#1E293B',
        ring: '#3B82F6',
        muted: '#64748B',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      },
    },
  },
  plugins: [],
};