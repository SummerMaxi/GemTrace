/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bento: {
          50: '#F7F7F8',
          100: '#EDEDEF',
          200: '#D4D4D8',
          300: '#A1A1AA',
          400: '#71717A',
          500: '#52525B',
        }
      },
      spacing: {
        '18': '4.5rem',
      },
      gridTemplateColumns: {
        'bento': 'repeat(auto-fit, minmax(300px, 1fr))',
      }
    },
  },
  plugins: [],
} 