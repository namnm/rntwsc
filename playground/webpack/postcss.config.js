// must not import tsx, it will conflict with nextjs
const minified = require('../app/src/codegen/class-names.min.json')

const map = process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES ? minified : {}

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-rename': {
      // @ts-ignore
      strategy: name => map[name] || name,
    },
    autoprefixer: {},
  },
}
