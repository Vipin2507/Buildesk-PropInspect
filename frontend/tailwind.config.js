/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          light: '#EFF6FF',
          dark: '#1e3270',
        },
        accent: {
          DEFAULT: '#F97316',
          dark: '#EA6A0A',
        },
      }
    }
  },
  plugins: []
}
