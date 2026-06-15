/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dde6ff',
          200: '#c3d1ff',
          300: '#9db4ff',
          400: '#748bff',
          500: '#4f5ff7',
          600: '#3d44e8',
          700: '#3033cc',
          800: '#282ca5',
          900: '#252983',
        },
        accent: {
          400: '#f97316',
          500: '#ea6508',
        },
        dark: {
          900: '#0a0b14',
          800: '#10121e',
          700: '#181a28',
          600: '#1e2132',
          500: '#272a3d',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0b14 0%, #181a28 50%, #1a1035 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(79,95,247,0.1), rgba(249,115,22,0.05))',
        'glow-primary': 'radial-gradient(circle at 50% 50%, rgba(79,95,247,0.3) 0%, transparent 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow': '0 0 30px rgba(79, 95, 247, 0.3)',
        'glow-orange': '0 0 30px rgba(249, 115, 22, 0.3)',
        'card': '0 4px 32px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 48px rgba(79, 95, 247, 0.2)',
      },
    },
  },
  plugins: [],
}
