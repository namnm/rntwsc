import type { Config } from 'prettier'

const twPlugin = require.resolve('prettier-plugin-tailwindcss')
const xmlPlugin = require.resolve('@prettier/plugin-xml')

export const config: Config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  objectWrap: 'preserve',
  arrowParens: 'avoid',
  requirePragma: false,
  insertPragma: false,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'ignore',
  plugins: [twPlugin, xmlPlugin],
  tailwindFunctions: ['tw', 'cva', 'clsx'],
  xmlQuoteAttributes: 'double',
  xmlSelfClosingSpace: true,
  xmlSortAttributesByKey: true,
  xmlWhitespaceSensitivity: 'ignore',
}
