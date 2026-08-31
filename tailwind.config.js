/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chess: {
          dark: '#161922',
          card: '#1e2230',
          boardDark: '#4a5568',
          boardLight: '#e2e8f0',
          gold: '#f59e0b',
          silver: '#94a3b8',
          bronze: '#b45309',
          accent: '#6366f1',
          accentHover: '#4f46e5',
          win: '#10b981',
          loss: '#ef4444',
          draw: '#6b7280'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
