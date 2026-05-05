/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite/plugin'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    flowbite,
    forms,
    typography,
  ],
}