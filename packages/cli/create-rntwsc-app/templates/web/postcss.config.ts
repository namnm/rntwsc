// must not import tsx, it will conflict with nextjs
import minified from '@/cli/create-rntwsc-app/templates/app/src/codegen/class-names.min.json'

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
