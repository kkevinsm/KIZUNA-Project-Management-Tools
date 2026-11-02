/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        asana: {
          bg: "#1e1f21",
          rail: "#151617",
          sidebar: "#1e1f21",
          card: "#252628",
          cardHover: "#2e2f32",
          border: "#37383b",
          borderSubtle: "#2a2b2d",
          text: "#f5f4f3",
          muted: "#a2a0a2",
          subtle: "#6d6c6e",
          red: "#f06a6a",
          redHover: "#df5757",
          blue: "#4573d2",
          blueHover: "#3562be",
          yellow: "#f5b324",
          avatar: "#d84b7f",
          // Status pills
          onTrackBg: "#183f30",
          onTrackText: "#4cd195",
          atRiskBg: "#4a3800",
          atRiskText: "#f7c244",
          offTrackBg: "#47181c",
          offTrackText: "#ff6b72",
          // Priority pills
          prioLowBg: "#183f30",
          prioLowText: "#4cd195",
          prioMedBg: "#4a3800",
          prioMedText: "#f7c244",
          prioHighBg: "#3c1e55",
          prioHighText: "#c77dff",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

