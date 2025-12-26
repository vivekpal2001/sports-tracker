/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Electric Blue
        primary: {
          50: '#e6fbff',
          100: '#b3f3ff',
          200: '#80ebff',
          300: '#4de3ff',
          400: '#1adbff',
          500: '#00d4ff',
          600: '#00a8cc',
          700: '#007d99',
          800: '#005166',
          900: '#002633',
        },
        // Accent - Lime Green
        lime: {
          50: '#f4ffe6',
          100: '#e0ffb3',
          200: '#cbff80',
          300: '#b7ff4d',
          400: '#a2ff1a',
          500: '#84ff00',
          600: '#6acc00',
          700: '#509900',
          800: '#356600',
          900: '#1b3300',
        },
        // Crimson
        crimson: {
          50: '#ffe6ec',
          100: '#ffb3c4',
          200: '#ff809c',
          300: '#ff4d74',
          400: '#ff1a4d',
          500: '#ff3366',
          600: '#cc0033',
          700: '#990026',
          800: '#66001a',
          900: '#33000d',
        },
        // Orange
        orange: {
          50: '#fff5e6',
          100: '#ffe0b3',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa31a',
          500: '#ff6b00',
          600: '#cc5500',
          700: '#994000',
          800: '#662a00',
          900: '#331500',
        },
        // Dark backgrounds
        dark: {
          50: '#2a2a3a',
          100: '#1f1f2e',
          200: '#18182a',
          300: '#14141f',
          400: '#0f0f1a',
          500: '#0a0a0f',
          600: '#08080c',
          700: '#050508',
          800: '#030305',
          900: '#000000',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-athletic': 'linear-gradient(135deg, #00d4ff 0%, #84ff00 50%, #ff6b00 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #14141f 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)',
        'glow-primary': 'radial-gradient(circle at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
        'glow-lime': 'radial-gradient(circle at center, rgba(132, 255, 0, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(0, 212, 255, 0.3)',
        'glow-md': '0 0 30px rgba(0, 212, 255, 0.4)',
        'glow-lg': '0 0 60px rgba(0, 212, 255, 0.5)',
        'glow-lime': '0 0 30px rgba(132, 255, 0, 0.4)',
        'glow-crimson': '0 0 30px rgba(255, 51, 102, 0.4)',
        'glow-orange': '0 0 30px rgba(255, 107, 0, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
