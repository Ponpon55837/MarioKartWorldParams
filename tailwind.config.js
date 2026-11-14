/** 以 CSS 變數（RGB 三元組）定義的主題色，支援 Tailwind 透明度修飾 */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  // constants/ 也有 class 字串（跑法色、賽道材質），需一併掃描
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: token("background"),
        sidebar: token("sidebar"),
        card: token("card"),
        raised: token("raised"),
        foreground: token("foreground"),
        secondary: token("secondary"),
        muted: token("muted"),
        ink: token("ink"),
        gold: token("gold"),
        "kart-red": token("kart-red"),
        "kart-blue": token("kart-blue"),
        "kart-green": token("kart-green"),
        road: token("road"),
        dirt: token("dirt"),
        water: token("water"),
        silver: token("silver"),
        bronze: token("bronze"),
        "signal-green": token("signal-green"),
        scrim: token("scrim"),
      },
      borderColor: {
        line: "rgb(var(--foreground) / 0.1)",
        "line-strong": "rgb(var(--foreground) / 0.18)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "var(--font-noto-tc)", "system-ui", "sans-serif"],
        display: ["var(--font-huninn)", "var(--font-noto-tc)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        press: "0 3px 0 rgb(var(--ink))",
        "press-sm": "0 1px 0 rgb(var(--ink))",
        lift: "0 5px 0 var(--lift-color, rgb(var(--ink)))",
        stage: "0 6px 0 var(--lift-color, rgb(var(--ink)))",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        pop: {
          from: { transform: "scale(0.6)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        pop: "pop 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
