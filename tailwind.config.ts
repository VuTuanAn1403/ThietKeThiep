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
        brand: {
          bg: "#FFFDF9",
          primary: "#B76E79",
          secondary: "#8FA79B",
          text: "#292624",
          accent: "#D4AF37",
          muted: "#F4EFEB",
          border: "#E8DFD8",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["Montserrat", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
