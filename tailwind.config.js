module.exports = {
  mode: 'jit',
  purge: [  // In v2.x, 'purge' is the correct key for JIT mode
    './src-site/index.html',
    './src-site/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}