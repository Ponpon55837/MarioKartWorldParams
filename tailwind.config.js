/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mario: {
          red: "#FF0000",
          blue: "#0066CC",
          yellow: "#FFD700",
          green: "#00AA00",
        },
        // 主題動態顏色
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        card: "var(--card)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      backgroundImage: {
        "theme-gradient": "var(--theme-gradient)",
        "card-gradient": "var(--card-gradient)",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "theme-transition": "themeTransition 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        themeTransition: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.8" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
