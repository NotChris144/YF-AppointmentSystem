/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        foreground: '#FFFFFF',
        muted: '#1F2937',
        'muted-foreground': '#9CA3AF',
        card: '#111827',
        'card-foreground': '#FFFFFF',
        border: '#374151',
        input: '#1F2937',
        primary: '#06b6d4',
        'primary-foreground': '#FFFFFF',
        secondary: '#2dd4bf',
        'secondary-foreground': '#FFFFFF',
        accent: '#4F46E5',
        'accent-foreground': '#FFFFFF',
        destructive: '#EF4444',
        'destructive-foreground': '#FFFFFF',
        ring: '#06b6d4',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      spacing: {
        'safe-top': 'var(--sat)',
        'safe-bottom': 'var(--sab)',
        'safe-left': 'var(--sal)',
        'safe-right': 'var(--sar)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}