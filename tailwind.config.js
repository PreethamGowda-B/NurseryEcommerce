/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          950: '#071710',
          900: '#0f2d21',
          800: '#1b4332',
          700: '#2d6a4f',
          600: '#386641',
          500: '#408c5c',
          400: '#52b788',
          300: '#74c69d',
          200: '#b7e4c7',
          100: '#e8f5e9',
          50: '#f0fdf4',
        },
        ivory: {
          50: '#ffffff',
          100: '#fcfbf7',
          200: '#faf9f6',
          300: '#f4f1ea',
          400: '#e9e4d8',
        },
        terracotta: {
          400: '#d98a68',
          500: '#c97a56',
          600: '#b56544',
        },
        sage: {
          300: '#c2cbd0',
          400: '#a3b18a',
          500: '#84a98c',
          600: '#52796f',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'natural':    '0 2px  16px rgba(15, 45, 33, 0.08)',
        'natural-lg': '0 8px  40px rgba(15, 45, 33, 0.12)',
        'natural-xl': '0 20px 60px rgba(15, 45, 33, 0.16)',
        'glow-green': '0 0    20px rgba(56, 102, 65, 0.28)',
        'xs':         '0 1px   3px rgba(15, 45, 33, 0.06)',
      },
      keyframes: {
        'reveal-up': {
          '0%':   { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)'  },
        },
        'float-leaf': {
          '0%':   { transform: 'translateY(0px) translateX(0px) rotate(0deg) scale(1)', opacity: '0' },
          '10%':  { opacity: '0.7' },
          '50%':  { transform: 'translateY(-120px) translateX(30px) rotate(180deg) scale(0.85)', opacity: '0.5' },
          '90%':  { opacity: '0.3' },
          '100%': { transform: 'translateY(-260px) translateX(-20px) rotate(360deg) scale(0.6)', opacity: '0' },
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '0.18' },
          '50%':       { transform: 'scale(1.04)', opacity: '0.32' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)',     opacity: '1'    },
          '50%':       { transform: 'scale(1.015)', opacity: '0.92' },
        },
        'leaf-sway': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':       { transform: 'rotate( 3deg)' },
        },
        'shimmer-sweep': {
          '0%':        { left: '-80%'  },
          '60%, 100%': { left: '140%' },
        },
        'gradient-shift': {
          '0%':   { 'background-position': '0% 50%'   },
          '50%':  { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%'   },
        },
      },
      animation: {
        'reveal-up':   'reveal-up   0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float-leaf':  'float-leaf  10s ease-in-out infinite',
        'pulse-ring':  'pulse-ring   4s ease-in-out infinite',
        'breathe':     'breathe      5s ease-in-out infinite',
        'leaf-sway':   'leaf-sway    3s ease-in-out infinite',
        'shimmer':     'shimmer-sweep 3.5s ease-in-out infinite',
        'gradient':    'gradient-shift 6s ease infinite',
      },
    },
  },
  plugins: [],
}
