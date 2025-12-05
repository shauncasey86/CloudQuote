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
          glass: "var(--bg-glass)",
        },
        border: {
          subtle: "var(--border-subtle)",
          glass: "var(--border-glass)",
          hover: "var(--border-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        // Brand colors - Wilson Interiors
        gold: {
          DEFAULT: "var(--color-gold)",
          light: "var(--color-gold-light)",
        },
        bronze: "var(--color-bronze)",
        navy: {
          DEFAULT: "var(--color-navy)",
          light: "var(--color-navy-light)",
        },
        // Semantic colors
        emerald: "var(--color-emerald)",
        green: "var(--color-green)",
        amber: "var(--color-amber)",
        danger: "var(--color-danger)",
        cyan: "var(--color-cyan)",
        // Legacy color mappings for compatibility
        violet: "var(--color-violet)",
        hotpink: "var(--color-pink)",
        electricblue: "var(--color-blue)",
        lime: "var(--color-lime)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        header: ["var(--font-header)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Courier New", "monospace"],
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
