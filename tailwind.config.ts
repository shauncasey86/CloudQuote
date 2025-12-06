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
        // Brand colors - Modern palette
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "#4F46E5",
        },
        secondary: "var(--color-secondary)",
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "#EA580C",
        },
        // Semantic colors
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        // Legacy color mappings for compatibility
        gold: {
          DEFAULT: "var(--color-primary)",
          light: "#818CF8",
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
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
      },
      borderRadius: {
        card: "1rem",
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
