// graphql-codegen require()s a plain `plugin` export; register tsx's
// require hook so the real implementation can live in index.ts.
require('tsx/cjs')
const { plugin } = require('./index.ts')

module.exports = {
  plugin,
}
