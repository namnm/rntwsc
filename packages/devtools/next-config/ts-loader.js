// we name it ts-loader to let nextjs not complain about its builtin
require('tsx/cjs')
module.exports = require('@/devtools/babel-loader').loader
