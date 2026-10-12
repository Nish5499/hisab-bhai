/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          yellow: '#FFE600',
          pink: '#FF4D8D',
          blue: '#2B59FF',
          green: '#22C55E',
          lime: '#A3E635',
          cream: '#FFFDF0',
          bg: '#FFFDF5',
          dark: '#121212',
          purple: '#A855F7',
          orange: '#FF8800',
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #000000',
        'neo': '4px 4px 0px #000000',
        'neo-lg': '6px 6px 0px #000000',
        'neo-xl': '8px 8px 0px #000000',
        'neo-pressed': '1px 1px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
