/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        background: "#0D0D0D",
        surface: "#1E1E2E",
        textPrimary: "#F1F5F9",
        textMuted: "#94A3B8",
        success: "#22C55E",
        error: "#EF4444",
        warning: "#F59E0B"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
