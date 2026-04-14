import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcf8",
          100: "#d7f6ed",
          600: "#0f766e",
          700: "#115e59",
        },
      },
    },
  },
  plugins: [],
};

export default config;
