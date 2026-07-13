// metro can not resolve typescript
// we need to have this file as cjs
require('tsx/cjs')
module.exports = require('./transform')
