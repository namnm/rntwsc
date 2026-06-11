// metro can not resolve typescript
// we need to have this file as cjs

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  target: __dirname,
  alias: false,
})
module.exports = require('./transform')
