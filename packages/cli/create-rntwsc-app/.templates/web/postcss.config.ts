// must not import tsx, it will conflict with nextjs
import minified from '../app/src/codegen/class-names.min.json'

const map = (
  process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES ? minified : {
}
) as Record<string, string | undefined>

export default {
  plugins: {
    '@tailwindcss/postcss': {
},
    'postcss-rename': {
      strategy: (name: string) => map[name] || name,
    },
    autoprefixer: {
},
  },
}
