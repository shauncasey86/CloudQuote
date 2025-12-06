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
          input: "var(--bg-input)",
          sidebar: "var(--bg-sidebar)",
        },
        border: {
          subtle: "var(--border-subtle)",
          default: "var(--border-default)",
          hover: "var(--border-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        // Brand colors
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
        },
        // Semantic colors
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        money: "var(--color-money)",
        // Legacy mappings
        gold: {
          DEFAULT: "var(--color-accent)",
          light: "var(--color-accent)",
        },
        emerald: "var(--color-success)",
        green: "var(--color-success)",
        amber: "var(--color-warning)",
        cyan: "var(--color-info)",
        violet: "var(--color-primary)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        header: ["var(--font-header)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Courier New", "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        card: "0.5rem",
        button: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
