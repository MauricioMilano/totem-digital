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
        cal: ["Cal Sans", "Inter", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Oxygen", "Ubuntu", "Cantarell", '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', "sans-serif"],
        "cal-body": ["Inter", "Cal Sans", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Oxygen", "Ubuntu", "Cantarell", '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', "sans-serif"],
      },
      colors: {
        // ─── DOMETTS Barber & Shop — paleta escura premium ───────────────
        // canvas = fundo base (espresso), ink = texto principal (cream)
        canvas: "#3B2618",
        "surface-soft": "#4A3220",
        "surface-card": "#54391F",
        "surface-dark": "#2E1E12",
        ink: "#F5EFE6",
        body: "#C4AE8F",
        // bordas / hairlines (antes estavam ausentes da config)
        hairline: "#5A422B",
        "border-strong": "#6E5334",
        brand: {
          primary: "#DCC39E", // sand / dourado — cor de destaque
          "primary-active": "#C9AD82",
        },
        "on-primary": "#3B2618", // texto sobre o accent (sand)
        signature: {
          coral: "#C15A32",
          forest: "#4E8A5C",
          cream: "#F5EFE6",
          peach: "#DFA277",
          mint: "#93BFA8",
          yellow: "#DCC39E",
          mustard: "#C99A45",
        },
        link: {
          DEFAULT: "#7FA3FF",
          active: "#A9C2FF",
        },
        info: {
          DEFAULT: "#6E9BE0",
          border: "#8FB4F0",
        },
        success: {
          DEFAULT: "#5FC48D",
          border: "#7FDCA6",
        },
        error: {
          DEFAULT: "#E07B5A",
          border: "#E8937A",
        },
        warning: {
          DEFAULT: "#E0B15C",
          border: "#E8C57A",
        },
        "pricing-ink": "#F5EFE6",
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
         md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "999px",
        full: "999px",
      },
      spacing: {
        0: "0px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
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
