/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220 16% 98%)',
        accent: 'hsl(263 74% 54%)',
        primary: 'hsl(220 89% 51%)',
        surface: 'hsl(0 0% 100%)',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      boxShadow: {
        'card': '0 4px 10px hsla(220, 16%, 30%, 0.1)',
      },
      spacing: {
        'lg': '16px',
        'md': '8px',
        'sm': '4px',
      },
    },
  },
  plugins: [],
}