require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  cwd: __dirname,
})

module.exports = require('@/devtools/next-config').config({
  dir: __dirname,
})
