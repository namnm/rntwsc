// this file will also be reused in nextjs code
// must not import tsx, it will conflict with nextjs
const { path } = require('@rntwsc/devtools/path')
const { twrncConfig } = require('./src/twrnc-config')
const {
  dependencies: { 'react-native': reactNativeVersion },
} = require('./package.json')

const extractClassNameOutputPath = path.join(
  __dirname,
  './src/codegen/class-names.min.json',
)

module.exports = {
  reactNativeVersion,
  twrncConfig,
  extractClassNameOutputPath,
}
