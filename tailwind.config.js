/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chassis: {
          dark: '#18191c',
          metal: '#24262b',
          border: '#32353d',
        },
        led: {
          off: '#1e232a',
          on: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.45)',
          red: '#ef4444',
          yellow: '#eab308',
          blue: '#3b82f6',
          green: '#22c55e',
        }
      },
      boxShadow: {
        'led-glow': '0 0 12px rgba(56, 189, 248, 0.65), inset 0 0 6px rgba(255, 255, 255, 0.7)',
        'led-red': '0 0 12px rgba(239, 68, 68, 0.75)',
        'chassis-inner': 'inset 0 3px 8px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.06)',
      }
    },
  },
  plugins: [],
}
