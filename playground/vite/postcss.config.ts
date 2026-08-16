import minified from '../app/src/codegen/class-names.min.json'

const map = minified as Record<string, string | undefined>

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-rename': {
      strategy: (name: string) => map[name] || name,
    },
    autoprefixer: {},
  },
}
