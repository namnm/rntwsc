export type ManifestEntry = {
  src: string
  dest: string
}

export const identityManifest: ManifestEntry[] = [
  {
    src: 'root/package.template.json',
    dest: 'package.json',
  },
  {
    src: 'root/pnpm-workspace.yaml',
    dest: 'pnpm-workspace.yaml',
  },
  {
    src: 'root/patches',
    dest: 'patches',
  },
  {
    src: 'root/tsconfig.base.template.json',
    dest: 'tsconfig.base.json',
  },
  {
    src: 'root/.env.template',
    dest: '.env',
  },
  {
    src: 'root/.env.example',
    dest: '.env.example',
  },
  {
    src: 'root/.gitignore.template',
    dest: '.gitignore',
  },
  {
    src: 'root/.prettierignore',
    dest: '.prettierignore',
  },
  {
    src: 'root/.dockerignore',
    dest: '.dockerignore',
  },
  {
    src: 'root/vscode-settings.json',
    dest: '.vscode/settings.json',
  },
  {
    src: 'root/devtools.js',
    dest: 'devtools.js',
  },
  {
    src: 'root/eslint.config.js',
    dest: 'eslint.config.js',
  },
  {
    src: 'root/prettier.config.js',
    dest: 'prettier.config.js',
  },
  {
    src: 'root/stylelint.config.js',
    dest: 'stylelint.config.js',
  },
  {
    src: 'root/tailwind.config.js',
    dest: 'tailwind.config.js',
  },
  {
    src: 'app/package.template.json',
    dest: 'app/package.json',
  },
  {
    src: 'app/app.json',
    dest: 'app/app.json',
  },
  {
    src: 'web/package.template.json',
    dest: 'web/package.json',
  },
]

export const playgroundSafeManifest: ManifestEntry[] = [
  {
    src: 'app/babel.config.js',
    dest: 'app/babel.config.js',
  },
  {
    src: 'app/babel-plugin-tw-config.js',
    dest: 'app/babel-plugin-tw-config.js',
  },
  {
    src: 'app/metro.config.js',
    dest: 'app/metro.config.js',
  },
  {
    src: 'app/react-native.config.js',
    dest: 'app/react-native.config.js',
  },
  {
    src: 'app/index.js',
    dest: 'app/index.js',
  },
  {
    src: 'app/src/app.tsx',
    dest: 'app/src/app.tsx',
  },
  {
    src: 'app/src/app.native.tsx',
    dest: 'app/src/app.native.tsx',
  },
  {
    src: 'app/src/tailwind-config.ts',
    dest: 'app/src/tailwind-config.ts',
  },
  {
    src: 'app/src/twrnc-config.ts',
    dest: 'app/src/twrnc-config.ts',
  },
  {
    src: 'app/src/components/link.tsx',
    dest: 'app/src/components/link.tsx',
  },
  {
    src: 'app/src/i18n/config.ts',
    dest: 'app/src/i18n/config.ts',
  },
  {
    src: 'app/src/i18n/index.ts',
    dest: 'app/src/i18n/index.ts',
  },
  {
    src: 'app/src/polyfill',
    dest: 'app/src/polyfill',
  },
  {
    src: 'app/src/pages/routes.ts',
    dest: 'app/src/pages/routes.ts',
  },
  {
    src: 'native/android',
    dest: 'app/android',
  },
  {
    src: 'native/ios',
    dest: 'app/ios',
  },
  {
    src: 'web/next.config.ts',
    dest: 'web/next.config.ts',
  },
  {
    src: 'web/postcss.config.ts',
    dest: 'web/postcss.config.ts',
  },
  {
    src: 'web/public',
    dest: 'web/public',
  },
  {
    src: 'web/src/proxy.ts',
    dest: 'web/src/proxy.ts',
  },
  {
    src: 'web/src/app/global.scss',
    dest: 'web/src/app/global.scss',
  },
  {
    src: 'web/src/app/tailwind.config.cjs',
    dest: 'web/src/app/tailwind.config.cjs',
  },
  {
    src: 'web/src/app/[locale]/page.tsx',
    dest: 'web/src/app/[locale]/page.tsx',
  },
]

export const newProjectOnlyManifest: ManifestEntry[] = [
  {
    src: 'app/tsconfig.template.json',
    dest: 'app/tsconfig.json',
  },
  {
    src: 'app/src/codegen/class-names.min.json',
    dest: 'app/src/codegen/class-names.min.json',
  },
  {
    src: 'app/src/i18n/labels',
    dest: 'app/src/i18n/labels',
  },
  {
    src: 'app/src/pages/route-paths.ts',
    dest: 'app/src/pages/route-paths.ts',
  },
  {
    src: 'app/src/pages/routes.native.ts',
    dest: 'app/src/pages/routes.native.ts',
  },
  {
    src: 'app/src/pages/home/index.tsx',
    dest: 'app/src/pages/home/index.tsx',
  },
  {
    src: 'web/tsconfig.template.json',
    dest: 'web/tsconfig.json',
  },
  {
    src: 'web/src/app/layout.tsx',
    dest: 'web/src/app/layout.tsx',
  },
]

export const fullManifest: ManifestEntry[] = [
  ...identityManifest,
  ...playgroundSafeManifest,
  ...newProjectOnlyManifest,
]

export const structuralManifest: ManifestEntry[] = playgroundSafeManifest
