/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        neon: {
          blue: '#00d4ff',
          pink: '#ff00aa',
          yellow: '#ffcc00',
          green: '#00ff88',
          purple: '#aa00ff',
        },
        night: {
          900: '#050a14',
          800: '#0a1628',
          700: '#0f1f38',
          600: '#152a4a',
          500: '#1c365c',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Orbitron', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'rain': 'rain 1s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        rain: {
          '0%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'neon-blue': '0 0 10px #00d4ff, 0 0 20px #00d4ff40',
        'neon-pink': '0 0 10px #ff00aa, 0 0 20px #ff00aa40',
        'neon-yellow': '0 0 10px #ffcc00, 0 0 20px #ffcc0040',
        'neon-green': '0 0 10px #00ff88, 0 0 20px #00ff8840',
      },
    },
  },
  plugins: [],
};
