require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  target: __dirname,
  alias: false,
})
require('./src')
