/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3B82F6', // Blue 500
        'secondary': '#10B981', // Green 500
        'accent': '#F59E0B', // Amber 500
        'neutral': '#6B7280', // Gray 500
        'base-100': '#F3F4F6', // Gray 100 (background)
        'base-content': '#1F2937', // Gray 800 (text)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}