// metro can not resolve typescript
// we need to have this file as cjs

require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  cwd: __dirname,
})
module.exports = require('./transform')
