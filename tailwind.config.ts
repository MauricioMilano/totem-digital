import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        haas: ["Haas Grotesk", "Haas", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Oxygen", "Ubuntu", "Cantarell", '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', "sans-serif"],
        "haas-disp": ["Haas Groot Disp", "Haas", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Oxygen", "Ubuntu", "Cantarell", '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', "sans-serif"],
        "inter-disp": ["Inter Display", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "#181d26",
          "primary-active": "#0d1218",
        },
        ink: "#181d26",
        body: "#333840",
        hairline: "#dddddd",
        "border-strong": "#9297a0",
        canvas: "#ffffff",
        "surface-soft": "#f8fafc",
        "surface-strong": "#e0e2e6",
        "surface-dark": "#181d26",
        "surface-dark-elevated": "#1d1f25",
        signature: {
          coral: "#aa2d00",
          forest: "#0a2e0e",
          cream: "#f5e9d4",
          peach: "#fcab79",
          mint: "#a8d8c4",
          yellow: "#f4d35e",
          mustard: "#d9a441",
        },
        link: {
          DEFAULT: "#1b61c9",
          active: "#1a3866",
        },
        info: {
          DEFAULT: "#254fad",
          border: "#458fff",
        },
        success: {
          DEFAULT: "#006400",
          border: "#39bf45",
        },
        "pricing-ink": "#1d1f25",
        // Keep shadcn compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xs: "2px",
        sm: "6px",
        md: "10px",
        lg: "12px",
        pill: "9999px",
        full: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },
      fontSize: {
        "display-xl": ["48px", { lineHeight: "1.1", fontWeight: "500" }],
        "display-lg": ["40px", { lineHeight: "1.2", fontWeight: "400" }],
        "display-md": ["32px", { lineHeight: "1.2", fontWeight: "400" }],
        "title-lg": ["24px", { lineHeight: "1.35", fontWeight: "400", letterSpacing: "0.12px" }],
        "title-md": ["20px", { lineHeight: "1.5", fontWeight: "400" }],
        "title-sm": ["18px", { lineHeight: "1.4", fontWeight: "500" }],
        "label-md": ["16px", { lineHeight: "1.4", fontWeight: "500" }],
        button: ["16px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "1.25", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "1.35", fontWeight: "500", letterSpacing: "0.16px" }],
        legal: ["13.12px", { lineHeight: "1.2", fontWeight: "600" }],
        "pricing-display": ["44.8px", { lineHeight: "1.1", fontWeight: "475" }],
        "pricing-section": ["28px", { lineHeight: "1.2", fontWeight: "475" }],
        "pricing-card-title": ["20px", { lineHeight: "1.3", fontWeight: "475" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
