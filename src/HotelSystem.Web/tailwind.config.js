/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false, // Locked to light mode — dark theme disabled
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1faf9',
          100: '#cdf0ea',
          200: '#9be0d4',
          300: '#60cac1',
          400: '#34b2a6',
          500: '#2ab09b', // Exact Match (Image 2)
          600: '#1d8f7e',
          700: '#197367',
          800: '#165c54',
          900: '#134d46',
        },
        secondary: {
          500: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        ripple: {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
          '100%': { transform: 'translate(-50%, -50%) scale(50)', opacity: 0 }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        ripple: 'ripple 600ms linear forwards',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out'
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke',
      }
    },
  },
  plugins: [],
}
