/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#0a0e17',
          card: '#111827',
          cardHover: '#172033',
          border: '#1f293d',
          accent: '#10b981',
          accentGlow: '#059669',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
