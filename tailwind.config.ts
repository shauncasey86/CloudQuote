import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          base: "var(--bg-base)",
          canvas: "var(--bg-canvas)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
        border: {
          subtle: "var(--border-subtle)",
          glass: "var(--border-glass)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        // Shared DNA colors
        violet: "var(--color-violet)",
        hotpink: "var(--color-pink)",
        cyan: "var(--color-cyan)",
        electricblue: "var(--color-blue)",
        lime: "var(--color-lime)",
        emerald: "var(--color-emerald)",
        danger: "var(--color-danger)",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      backdropBlur: {
        glass: "20px",
      },
      backgroundImage: {
        "gradient-nebula": "var(--gradient-nebula)",
        "gradient-aurora": "var(--gradient-aurora)",
        "gradient-success": "var(--gradient-success)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        "glow-violet": "var(--glow-violet)",
        "glow-pink": "var(--glow-pink)",
        "glow-cyan": "var(--glow-cyan)",
        "glow-success": "var(--glow-success)",
      },
      borderRadius: {
        card: "1.5rem",
        button: "9999px",
        tag: "0.5rem",
      },
      transitionDuration: {
        "200": "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
