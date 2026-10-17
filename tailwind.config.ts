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
        app: {
          bg: "#090D16",
          surface: "#111827",
          border: "#1E293B",
          borderActive: "#334155",
        },
      },
    },
  },
  plugins: [],
};

export default config;
