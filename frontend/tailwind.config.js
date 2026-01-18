/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F3',
          100: '#FFE8E3',
          200: '#FFD4CC',
          300: '#FFB4A2',
          400: '#FF9B85',
          500: '#FF8068',
          600: '#E86550',
          DEFAULT: '#FFB4A2',
        },
        secondary: {
          50: '#F0FAF7',
          100: '#DCF3EC',
          200: '#B5E2D8',
          300: '#8DD1C4',
          400: '#65C0B0',
          500: '#4DAA9A',
          DEFAULT: '#B5E2D8',
        },
        accent: {
          50: '#FFFCF5',
          100: '#FFF8E8',
          200: '#FFE5B4',
          300: '#FFD98A',
          400: '#FFCD60',
          500: '#FFC136',
          DEFAULT: '#FFE5B4',
        },
        background: '#FFF9F5',
        text: {
          primary: '#5D5D5D',
          secondary: '#8A8A8A',
          light: '#B0B0B0',
        },
        warm: {
          gray: '#5D5D5D',
          cream: '#FFF9F5',
          beige: '#F5EBE0',
        }
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
        display: ['Noto Serif TC', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'soft-xl': '0 20px 60px -15px rgba(0, 0, 0, 0.12), 0 4px 20px -4px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(255, 180, 162, 0.4)',
        'glow-secondary': '0 0 20px rgba(181, 226, 216, 0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'flip': 'flip 0.6s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}
