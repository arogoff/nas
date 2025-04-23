// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(button|input|select|ripple|spinner|form|listbox|divider|popover|scroll-shadow).js",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};