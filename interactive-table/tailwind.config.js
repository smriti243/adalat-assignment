/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        customBlue: '#3D52A0', // Define your custom color
      },
      fontFamily: {
        calibri: ['Calibri', 'Arial', 'sans-serif'], // Add Calibri with fallback fonts
      },
    },
  },
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  plugins: [],
};
