import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fizz: "#D8423A",
        ink: "#171717",
        cloud: "#F5F5F7"
      },
      fontFamily: {
        display: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["var(--font-lora)", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
