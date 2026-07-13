// must not import tsx, it will conflict with nextjs
const minified = require('../app/src/codegen/class-names.min.json')

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-rename': {
      // @ts-ignore
      strategy: name => minified[name] || name,
    },
    autoprefixer: {},
  },
}
