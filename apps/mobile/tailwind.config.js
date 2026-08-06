/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#19734E',
          50:  '#edf7f2',
          100: '#d0ecdf',
          500: '#19734E',
          600: '#145f40',
          700: '#0f4831',
        },
      },
    },
  },
  plugins: [],
}
