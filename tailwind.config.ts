import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          soft: "var(--primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        border: "var(--border)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        aurora: {
          bg: "#0B0B12",        // nền tối chủ đạo
          surface: "#12121C",   // nền card/section
          glass: "rgba(255,255,255,0.06)",   // nền kính mờ
          glassBorder: "rgba(255,255,255,0.12)",
          violet: "#7C3AED",
          pink: "#EC4899",
          cyan: "#22D3EE",
          indigo: "#6366F1",
        },
        brand: {
          bg: "#FFFDFB",
          ivory: "#FFFDFB",
          blush: "#FAF7F5",
          rose: "#F8F3F1",
          dark: "#1F1B1C",
          muted: "#756B70",
          accent: "#E85B6A",
          accentSoft: "#F27B88",
          dustyRose: "#D98B93",
          gold: "#C5A880",
          border: "#EAE4DF",
          primary: "#E85B6A",
          secondary: "#8FA79B",
          text: "#1F1B1C",
        },
        admin: {
          bg: "#F8F9FB",
          sidebar: "#FFFFFF",
          border: "#E5E7EB",
          text: "#1F2937",
          muted: "#6B7280",
          accent: "#4F46E5",
          accentSoft: "#EEF2FF",
          hover: "#F3F4F6",
          success: "#059669",
          warning: "#D97706",
          danger: "#DC2626",
        },
      },
      backgroundImage: {
        "aurora-gradient": "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
        "aurora-gradient-alt": "linear-gradient(135deg, #22D3EE 0%, #6366F1 100%)",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        display: ["Cormorant Garamond", "Playfair Display", "serif"],
        sans: ["Plus Jakarta Sans", "Montserrat", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(31, 27, 28, 0.04), 0 4px 6px -4px rgba(31, 27, 28, 0.02)",
        card: "0 10px 30px -5px rgba(31, 27, 28, 0.05), 0 4px 12px -2px rgba(31, 27, 28, 0.03)",
        floating: "0 20px 40px -10px rgba(31, 27, 28, 0.08), 0 8px 16px -4px rgba(31, 27, 28, 0.04)",
        glow: "0 0 25px -5px rgba(232, 91, 106, 0.25)",
        "depth-sm": "0 4px 12px -2px rgba(31, 27, 28, 0.06), 0 2px 4px -1px rgba(31, 27, 28, 0.03)",
        "depth-md": "0 12px 28px -6px rgba(31, 27, 28, 0.10), 0 6px 12px -3px rgba(31, 27, 28, 0.05)",
        "depth-lg": "0 24px 48px -12px rgba(31, 27, 28, 0.12), 0 12px 24px -6px rgba(31, 27, 28, 0.06)",
        "admin-sm": "0 1px 3px rgba(0, 0, 0, 0.04)",
        "admin-md": "0 4px 12px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "reveal-up": "reveal-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "reveal-scale": "reveal-scale 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "float": "float-gentle 6s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out both",
        "slide-up": "slide-up-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        "reveal-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-scale": {
          from: { opacity: "0", transform: "scale(0.95) translateY(20px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up-enter": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      perspective: {
        "none": "none",
        "800": "800px",
        "1000": "1000px",
        "1200": "1200px",
        "1500": "1500px",
      },
    },
  },
  plugins: [],
};
export default config;
