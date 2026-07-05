module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cogni: {
          blue: {
            light: '#F4F6F8',
            DEFAULT: '#0E243D',
            dark: '#07182C',
          },
          teal: {
            light: '#E6F4F1',
            DEFAULT: '#2A9D8F',
            dark: '#1E7168',
          },
          amber: '#FFC107',
          gray: {
            bg: '#F4F6F8',
            text: '#0E243D',
          }
        },
      },
    },
  },
  plugins: [],
}
