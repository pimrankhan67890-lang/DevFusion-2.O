/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#64748B",
        paper: "#F7F8FB",
        line: "#E2E8F0",
        brand: "#1F4E79",
        teal: "#0F766E",
        amber: "#B7791F"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(23, 32, 51, 0.08)",
        soft: "0 10px 28px rgba(23, 32, 51, 0.07)"
      }
    }
  },
  plugins: []
};
